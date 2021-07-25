const Crawler = require("crawler")
const Logger = require("./logger")
const PageAuditor = require("./page-auditor")
const events = require("events");
const UrlTools = require("./url-tools")

const SiteAuditorEvents = {
	ON_CRAWL_PAGE: 'on-crawl-page',
}

class SiteAuditor extends UrlTools{

	constructor(baseUrl) {
		super(baseUrl)

		this.logger = new Logger(this);
		this.pageAuditor = new PageAuditor(this.logger);
		this.alreadyCrawled = [];

		// Events.
		this.emitter = new events.EventEmitter();
		this.emitter.on(SiteAuditorEvents.ON_CRAWL_PAGE, data => this.pageAuditor.auditPage(data.res, data.$))
	}

	/**
	 * Lance l'audit.
	 */
	run() {
		// INitialise le  sitemap depuis robots.txt.
		this.checkRobots();

		// Crawl le sitemap.
		if (this.sitemap) {
			this.crawlFromSitemap();
		} else {
			this.crawlPage(this.baseUrl);
		}
	}

	/**
	 * Crawl la lsite de page.
	 *
	 * @param pages
	 */
	crawlPage(pages, fromPage = '') {
		// INitialisation des pages à crawler.
		if (!Array.isArray(pages)) {
			pages = [pages];
		}
		pages = pages.filter((url => {
			return this.alreadyCrawled.indexOf(url) < 0;
		}))
		this.alreadyCrawled = this.alreadyCrawled + pages;

		pages = pages.map(url => {
			return {
				uri: url,
				callback: (error, res, done) => this.onCrawlPage(error, res, done, url)
			}
		})

		this.crawler = new Crawler({
			maxConnections: 10,
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
		})
			.queue(pages)
	}

	/**
	 * Action au crawl.
	 *
	 * @param error
	 * @param res
	 * @param done
	 */
	onCrawlPage(error, res, done, fromPage) {
	    // console.log(res.body)
		if( !res.request ){
			return;
		}

		this.currentUrl = res.request.uri.href;
		console.log(this.currentUrl);

		if (error) {
			console.log(res);
			console.log(error);
		} else {
			const $ = res.$;

			if (res.statusCode != 200) {
				this.logger.log(res.statusCode, res.statusCode, {from: fromPage})
			} else {
				if ($) {
					// Crawl de la page
					this.emitter.emit(SiteAuditorEvents.ON_CRAWL_PAGE, {
						res: res,
						$: $,
						fromPage: fromPage,
					});
					// On continue sur d'autres pages.
					try{
						this.crawlPage(this.getLinks(res), this.currentUrl);
					} 
					catch(e){
						console.log('nonoernonn')
					}
					
				}

			}

		}
		done();
	}

	/**
	 * Vérifie le robots et instancie le sitemap.
	 *
	 */
	checkRobots() {
		const crawler = new Crawler(
			{
				maxConnections: 10,
				// This will be called for each crawled page
				callback: (error, res, done) => this.logRobotsTxt(error, res, done)
			}
		)
			.queue(this.baseUrl + 'robots.txt')
	}

	/**
	 * Test du sitemap dans le robots txt.
	 *
	 * @param error
	 * @param res
	 * @param done
	 */
	logRobotsTxt(error, res, done) {
		// test de la présence du sitemap.
		if (res.body.indexOf('Sitemap: ') < 0) {
			this.logger.error('Pas de sitemap dans le robots.txt', '', res.request.uri.href)
		} else {
			this.sitemap = res.body.split('Sitemap: ')[1].split('\n')[0]
		}
	}

	/**
	 * Retourne la liste dse links à crawler pour la page.
	 *
	 * @param res
	 * @returns {[]}
	 */
	getLinks(res) {
		var links = [];
		const $ = res.$;
		if ($) {
			// Parcours des liens et link alternate (mulitlingue).
			$('a[href], link[rel="alternate"]').each((i, n) => {
				let href = $(n).attr('href');

				href = this.initLink(href);
				links.push(href)
			})
			links = links.filter(item => {
				return !(
					item.length === 0
					|| item[0] === '#'
					|| item.toLowerCase().indexOf('tel:') === 0
					|| item.toLowerCase().indexOf('mailto:') === 0
					|| item.toLowerCase().indexOf('javascript:') === 0
					|| (item.indexOf('http') === 0 && item.indexOf(this.baseUrl) !== 0)
				)
					;
			}).map(item => {
				if (item[0] === '/') {
					return this.baseUrl + item.slice(1)
				}
				return item;
			})

			links = [...new Set(links)]
		}

		return links
	}

}


module.exports = SiteAuditor
module.exports.SiteAuditorEvents = SiteAuditorEvents
