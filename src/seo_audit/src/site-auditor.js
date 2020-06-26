const Crawler = require("crawler")
const Logger = require("./logger")
const PageAuditor = require("./page-auditor")
const events = require("events");

const SiteAuditorEvents = {
	ON_CRAWL_PAGE: 'on-crawl-page',
}

class SiteAuditor {

	constructor(baseUrl) {
		this.baseUrl = baseUrl + (baseUrl.slice(-1) != '/' ? '/' : '');
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

		this.crawler = new Crawler({
			maxConnections: 10,
			// This will be called for each crawled page
			callback: (error, res, done) => this.onCrawlPage(error, res, done, fromPage)
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
		if( !res.request ){
			return;
		}

		this.currentUrl = res.request.uri.href;
		console.log(this.currentUrl);

		if (error) {
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
					this.crawlPage(this.getLinks(res), this.currentUrl);
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
				links.push($(n).attr('href'))
			})
			links = links.filter(item => {
				return !(
					item.length === 0
					|| item[0] === '#'
					|| item.indexOf('tel:') === 0
					|| item.indexOf('mailto:') === 0
					|| item.indexOf('javascript:') === 0
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
