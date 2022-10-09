"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditCrawler = void 0;
const WebAuditConfig_1 = require("../core/WebAuditConfig");
const WebAuditContext_1 = require("../core/WebAuditContext");
const Crawler = require('crawler');
/**
 * Website crawler.
 */
class WebAuditCrawler {
    constructor(options) {
        this.parsed_urls = [];
        this.defaultOptions = {
            crawler_options: {
                maxConnections: 10,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                retries: 0,
            },
            allowed_status: [200, 201, 202, 203, 204]
        };
        this.options = Object.assign(Object.assign({}, this.defaultOptions), options);
        this.cleanBaseUrl();
    }
    /**
     * Crawl url.
     */
    crawl() {
        // Define crawler.
        this.crawler = new Crawler(this.options.crawler_options);
        this.crawler.on('drain', () => {
            // @ts-ignore
            this.onDone(this.parsed_urls);
        });
        this.crawlUrls([this.options.base_url]);
        return new Promise((resolve, reject) => {
            this.onDone = resolve;
        });
    }
    /**
     * Crawl a page.
     *
     * @param urls
     * @param origin
     * @private
     */
    crawlUrls(urls, origin) {
        // Filter eligible urls (html, domain and not already crawled).
        const eligible_urls = this.getEligibleUrls(urls);
        this.addToParsedUrls(eligible_urls);
        // Add new urls to queue
        if (eligible_urls.length) {
            this.crawler.queue(eligible_urls.map(url => {
                return {
                    'uri': url.toString(),
                    'callback': (error, res, done) => this.onPageCrawled(error, res, done, url, origin)
                };
            }));
        }
    }
    /**
     * Parse only domain url.
     *
     * @param url
     * @private
     */
    isDomainUrl(url) {
        return url.host === this.options.base_url.host;
    }
    /**
     * Return true if url is eligible (may be HMTL extension)
     * @param url
     * @private
     */
    isHtmlUrl(url) {
        const ext = url.pathname.split('.');
        if (ext.length > 1) {
            return ['html', 'html'].indexOf(ext.slice(-1)[0]) > -1;
        }
        return true;
    }
    /**
     * On page crawled.
     *
     * @param error
     * @param res
     * @param done
     * @param origin
     * @private
     */
    onPageCrawled(error, res, done, url, origin) {
        var _a, _b;
        WebAuditContext_1.WebAuditContext.current.setData('Page crawled').setUrl(url);
        // Error.
        if (error) {
            WebAuditConfig_1.WebAuditConfig.logger.error(error);
            done();
        }
        // Status.
        // @ts-ignore
        if (this.options.allowed_status.indexOf(res.statusCode) < 0) {
            WebAuditConfig_1.WebAuditConfig.logger.warning(`Url respond with status ${res.statusCode}. ${origin ? `Found in ${origin}` : ''}`);
            done();
        }
        // No returned uri.
        if (!((_a = res.request) === null || _a === void 0 ? void 0 : _a.uri.href)) {
            WebAuditConfig_1.WebAuditConfig.logger.error(`No uri`);
            done();
        }
        const parsed_url = new URL(res.request.uri.href);
        // Store found page.
        (_b = WebAuditConfig_1.WebAuditConfig.storage) === null || _b === void 0 ? void 0 : _b.add('page_found', WebAuditContext_1.WebAuditContext.current, {
            url: url,
            parsed_url: parsed_url,
            origin: origin,
            status: res.statusCode
        });
        // Redirection
        if (parsed_url.toString() !== url.toString()) {
            WebAuditConfig_1.WebAuditConfig.logger.warning(`Server redirection from ${url.toString()} to ${parsed_url.toString()}`);
        }
        // Parse content.
        try {
            WebAuditConfig_1.WebAuditConfig.logger.message(`Parsing ${parsed_url}`);
            this.crawlUrls(this.getUrlsInBody(res.$, parsed_url));
        }
        catch (e) {
            WebAuditConfig_1.WebAuditConfig.logger.warning(e);
        }
        done();
    }
    /**
     * Return all eligible url available in the body.
     *
     * @param $
     * @private
     */
    getUrlsInBody($, origin) {
        const urls = [];
        if (!$)
            return urls;
        $('a[href], link[rel="alternate"]').each((i, link) => {
            let href = $(link).attr('href');
            try {
                urls.push(this.getCleanUrlFromHref(href, origin));
            }
            catch (e) {
                // Config.logger.warning(`Not a valid url ${href}`);
            }
        });
        return this.getEligibleUrls(urls);
    }
    /**
     * Clean base url.
     *
     * @private
     */
    cleanBaseUrl() {
        try {
            this.options.base_url = new URL(this.options.base_url);
            // define domain
            this.options.domain = new URL(this.options.base_url);
            this.options.domain.hash = '';
            this.options.domain.pathname = '';
            this.options.domain.search = '';
        }
        catch (e) {
            WebAuditConfig_1.WebAuditConfig.logger.exit(`Base URL is not of type URL`);
        }
    }
    /**
     * Return true if url is already queued.
     *
     * @param url
     * @private
     */
    isAlreadyParsed(url) {
        return this.parsed_urls.filter(parsed => {
            return parsed.toString().replace(parsed.hash, '') === url.toString().replace(url.hash, '');
        }).length;
    }
    /**
     * Add Url to parsed URLS.
     * @param url
     * @private
     */
    addToParsedUrl(url) {
        if (!this.isAlreadyParsed(url)) {
            this.parsed_urls.push(url);
        }
    }
    /**
     * Add urls to parsed urls.
     *
     * @param urls
     * @private
     */
    addToParsedUrls(urls) {
        urls.forEach(url => this.addToParsedUrl(url));
    }
    /**
     * Return only crawl eligible urls.
     *
     * @param urls
     * @private
     */
    getEligibleUrls(urls) {
        return urls.filter(url => !this.isAlreadyParsed(url) && this.isDomainUrl(url) && this.isHtmlUrl(url));
    }
    /**
     * To readable urls.
     *
     * @param urls
     * @private
     */
    readable(urls) {
        return urls.map(url => url.toString());
    }
    /**
     * Return clea url from href.
     *
     * @param href
     * @param origin
     * @private
     */
    getCleanUrlFromHref(href, origin) {
        // Deal with relative href.
        if (href.indexOf('/') === 0 && href.length > 1) {
            // @ts-ignore
            href = (`${this.options.domain.toString()}${href}`);
        }
        // Deal with parameters urls.
        if (href.indexOf('?') === 0 && href.length > 1) {
            const url = new URL(origin);
            url.search = href;
            href = url.toString();
        }
        return new URL(href.replace(/\/\//g, '/'));
    }
}
exports.WebAuditCrawler = WebAuditCrawler;
