"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditCrawler = exports.WebAuditCrawlerEvents = void 0;
const WebAuditConfig_1 = require("../core/WebAuditConfig");
const WebAuditContext_1 = require("../core/WebAuditContext");
const WebAuditEvent_1 = require("../core/WebAuditEvent");
const Crawler = require('crawler');
/**
 * Events.
 *
 * @type {{onCreateCrawl: string}}
 */
exports.WebAuditCrawlerEvents = {
    createCrawl: 'crawler__createCrawl',
    beforeCrawl: 'crawler__beforeCrawl',
    afterCrawl: 'crawler__afterCrawl',
    onCrawlUrls: 'crawler__onCrawlUrls',
    onPageCrawled: 'crawler__onPageCrawled',
    onPageCrawledError: 'crawler__onPageCrawledError',
    onPageCrawledBadStatus: 'crawler__onPageCrawledBadStatus',
    onPageCrawledNoUri: 'crawler__onPageCrawledNoUri',
    onPageCrawledRedirected: 'crawler__onPageCrawledRedirected',
};
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
            followSearchParams: true,
        };
        this.parsedUrls = [];
        this.options = Object.assign(Object.assign({}, this.defaultOptions), options);
        // Prepare options.
        this.cleanBaseUrl();
        // Emit.
        WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.createCrawl, { crawler: this });
        // Prepare storage.
        (_a = WebAuditConfig_1.WebAuditConfig.storage) === null || _a === void 0 ? void 0 : _a.installStore('page_found', WebAuditContext_1.WebAuditContext.current, {
            url: 'Referenced url',
            status: `Status`,
            size: `Content length`,
            parsedUrl: 'Final URL (if redirected)',
            origin: `Orignal page (where url is referenced)`,
        });
    }
    /**
     * Crawl url.
     */
    crawl() {
        // Define crawler.
        this.crawler = new Crawler(this.options.crawlerOptions);
        WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.beforeCrawl, { crawler: this });
        this.crawler.on('drain', () => {
            if (this.onDone) {
                this.onDone(this.parsedUrls);
                WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.afterCrawl, { crawler: this });
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
        WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onCrawlUrls, { crawler: this, urlsList: urls });
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
        const eventData = { error: error, res: res, url: url, origin: origin };
        WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onPageCrawled, { crawler: this, data: eventData });
        // Error.
        if (error) {
            WebAuditConfig_1.WebAuditConfig.logger.error(error);
            WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onPageCrawledError, { crawler: this, data: eventData });
            done();
            return;
        }
        // Status.
        if (this.options.allowedStatus && ((_a = this.options.allowedStatus) === null || _a === void 0 ? void 0 : _a.indexOf(res.statusCode)) < 0) {
            WebAuditConfig_1.WebAuditConfig.logger.warning(`Url respond with status ${res.statusCode}. ${origin ? `Found in ${origin}` : ''}`);
            WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onPageCrawledBadStatus, { crawler: this, data: eventData });
            done();
            return;
        }
        // No returned uri.
        if (!((_b = res.request) === null || _b === void 0 ? void 0 : _b.uri.href)) {
            WebAuditConfig_1.WebAuditConfig.logger.error(`No uri`);
            WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onPageCrawledNoUri, { crawler: this, data: eventData });
            done();
            return;
        }
        const parsedUrl = new URL(res.request.uri.href);
        const gotRedirected = parsedUrl.toString() !== url.toString();
        // Store found page.
        const _parsedUrl = gotRedirected ? parsedUrl : null;
        (_c = WebAuditConfig_1.WebAuditConfig.storage) === null || _c === void 0 ? void 0 : _c.add('page_found', WebAuditContext_1.WebAuditContext.current, {
            url,
            _parsedUrl,
            origin,
            status: res.statusCode,
            size: res.headers['content-length'],
        });
        // Redirection
        if (gotRedirected) {
            WebAuditConfig_1.WebAuditConfig.logger.warning(`Got redirected from ${url.toString()} to ${parsedUrl.toString()}`);
            WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onPageCrawledRedirected, { crawler: this, data: eventData });
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
                const url = this.getCleanUrlFromHref(href, origin);
                if (url) {
                    urls.push(url);
                }
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
        let eligibleUrls = urls.filter((url) => {
            return (!this.isAlreadyParsed(url) &&
                this.isDomainUrl(url) &&
                this.isHtmlUrl(url) &&
                this.isUserEligible(url));
        });
        if (eligibleUrls.length > 1) {
            eligibleUrls = this.uniqueUrls(eligibleUrls);
        }
        return eligibleUrls;
    }
    /**
     * Return true if url is eligible from user callback.
     *
     * @param url
     * @private
     */
    isUserEligible(url) {
        return this.options.isEligibleUrl ? this.options.isEligibleUrl(url) : true;
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
        // Deal with anchor.
        if (input.indexOf('#') === 0) {
            return null;
        }
        // Deal with relative href.
        if (input.indexOf('/') === 0 && input.length > 1) {
            input = `${(_a = this.options.domain) === null || _a === void 0 ? void 0 : _a.toString()}${input}`;
        }
        // Deal with parameters urls.
        if (this.options.followSearchParams && input.indexOf('?') === 0) {
            if (input.length > 1) {
                const url = new URL(origin);
                url.search = input;
                input = url.toString();
            }
            else {
                return null;
            }
        }
        const url = new URL(input.replace(/\/\//g, '/'));
        // Check user eligibility.
        if (!this.options.followSearchParams) {
            url.search = '';
        }
        return url;
    }
}
exports.WebAuditCrawler = WebAuditCrawler;
