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
    /**
     * Constructor.
     *
     * @param options
     */
    constructor(options) {
        var _a;
        this.defaultOptions = {
            crawlerOptions: {
                maxConnections: 10,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
                retries: 0,
            },
            allowedStatus: [200, 201, 202, 203, 204],
        };
        this.parsedUrls = [];
        this.options = Object.assign(Object.assign({}, this.defaultOptions), options);
        // Prepare options.
        this.cleanBaseUrl();
        // Prepare storage.
        (_a = WebAuditConfig_1.WebAuditConfig.storage) === null || _a === void 0 ? void 0 : _a.installStore('page_found', WebAuditContext_1.WebAuditContext.current, {
            url: 'Referenced url',
            parsedUrl: 'Final URL (if redirected)',
            origin: `Orignal page (where url is referenced)`,
            status: `Status`,
        });
    }
    /**
     * Crawl url.
     */
    crawl() {
        // Define crawler.
        this.crawler = new Crawler(this.options.crawlerOptions);
        this.crawler.on('drain', () => {
            if (this.onDone) {
                this.onDone(this.parsedUrls);
            }
        });
        this.crawlUrls([this.options.baseUrl]);
        return new Promise((resolve) => {
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
        const eligibleUrls = this.getEligibleUrls(urls);
        // Add new urls to queue
        if (eligibleUrls.length) {
            this.addToParsedUrls(eligibleUrls);
            this.crawler.queue(eligibleUrls.map((url) => {
                return {
                    uri: url.toString(),
                    callback: (error, res, done) => this.onPageCrawled(error, res, done, url, origin),
                };
            }));
        }
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
        var _a, _b, _c;
        WebAuditContext_1.WebAuditContext.current.setData('Page crawled').setUrl(url);
        // Error.
        if (error) {
            WebAuditConfig_1.WebAuditConfig.logger.error(error);
            done();
            return;
        }
        // Status.
        if (this.options.allowedStatus && ((_a = this.options.allowedStatus) === null || _a === void 0 ? void 0 : _a.indexOf(res.statusCode)) < 0) {
            WebAuditConfig_1.WebAuditConfig.logger.warning(`Url respond with status ${res.statusCode}. ${origin ? `Found in ${origin}` : ''}`);
            done();
            return;
        }
        // No returned uri.
        if (!((_b = res.request) === null || _b === void 0 ? void 0 : _b.uri.href)) {
            WebAuditConfig_1.WebAuditConfig.logger.error(`No uri`);
            done();
            return;
        }
        const parsedUrl = new URL(res.request.uri.href);
        // Store found page.
        (_c = WebAuditConfig_1.WebAuditConfig.storage) === null || _c === void 0 ? void 0 : _c.add('page_found', WebAuditContext_1.WebAuditContext.current, {
            url,
            parsedUrl,
            origin,
            status: res.statusCode,
        });
        // Redirection
        if (parsedUrl.toString() !== url.toString()) {
            WebAuditConfig_1.WebAuditConfig.logger.warning(`Got redirected from ${url.toString()} to ${parsedUrl.toString()}`);
        }
        // Parse content.
        try {
            WebAuditConfig_1.WebAuditConfig.logger.message(`Parsing ${parsedUrl}`);
            this.crawlUrls(this.getUrlsInBody(res.$, parsedUrl), parsedUrl);
        }
        catch (error) {
            WebAuditConfig_1.WebAuditConfig.logger.warning(error);
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
        if (!$) {
            return urls;
        }
        $('a[href], link[rel="alternate"]').each((i, link) => {
            const href = $(link).attr('href');
            try {
                urls.push(this.getCleanUrlFromHref(href, origin));
            }
            catch (error) {
                WebAuditConfig_1.WebAuditConfig.logger.warning(`Not a valid url ${href}`);
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
            this.options.baseUrl = new URL(this.options.baseUrl);
            // define domain
            this.options.domain = new URL(this.options.baseUrl);
            this.options.domain.hash = '';
            this.options.domain.pathname = '';
            this.options.domain.search = '';
        }
        catch (erro) {
            WebAuditConfig_1.WebAuditConfig.logger.exit(`Base URL is not of type URL`);
        }
    }
    /**
     * Parse only domain url.
     *
     * @param url
     * @private
     */
    isDomainUrl(url) {
        return url.host === this.options.baseUrl.host;
    }
    /**
     * Return true if url is eligible (may be HMTL extension)
     *
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
     * Return true if url is already queued.
     *
     * @param url
     * @private
     */
    isAlreadyParsed(url) {
        return this.parsedUrls.filter((parsed) => {
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
            this.parsedUrls.push(url);
        }
    }
    /**
     * Add urls to parsed urls.
     *
     * @param urls
     * @private
     */
    addToParsedUrls(urls) {
        urls.forEach((url) => this.addToParsedUrl(url));
    }
    /**
     * Return only crawl eligible urls.
     *
     * @param urls
     * @private
     */
    getEligibleUrls(urls) {
        let eligibleUrls = urls.filter((url) => !this.isAlreadyParsed(url) && this.isDomainUrl(url) && this.isHtmlUrl(url));
        if (eligibleUrls.length > 1) {
            eligibleUrls = this.uniqueUrls(eligibleUrls);
        }
        return eligibleUrls;
    }
    /**
     * To readable urls.
     *
     * @param urls
     * @private
     */
    readable(urls) {
        return urls.map((url) => url.toString());
    }
    /**
     * Unique urls.
     *
     * @param urls
     * @private
     */
    uniqueUrls(urls) {
        const count = {};
        return urls.filter((url) => {
            const str = url.toString();
            count[str] = count[str] ? count[str] + 1 : 1;
            return count[str] < 2;
        });
    }
    /**
     * Return clea url from href.
     *
     * @param href
     * @param origin
     * @private
     */
    getCleanUrlFromHref(href, origin) {
        var _a;
        let input = href;
        // Deal with relative href.
        if (input.indexOf('/') === 0 && input.length > 1) {
            input = `${(_a = this.options.domain) === null || _a === void 0 ? void 0 : _a.toString()}${input}`;
        }
        // Deal with parameters urls.
        if (input.indexOf('?') === 0 && input.length > 1) {
            const url = new URL(origin);
            url.search = input;
            input = url.toString();
        }
        return new URL(input.replace(/\/\//g, '/'));
    }
}
exports.WebAuditCrawler = WebAuditCrawler;
