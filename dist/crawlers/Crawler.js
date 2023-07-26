"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditCrawler = exports.WebAuditCrawlerEvents = void 0;
const WebAuditConfig_1 = require("../core/WebAuditConfig");
const WebAuditContext_1 = require("../core/WebAuditContext");
const WebAuditEvent_1 = require("../core/WebAuditEvent");
const UrlWrapper_1 = require("../core/UrlWrapper");
const PageWrapper_1 = require("../journey/PageWrapper");
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
    onPageContent: 'crawler__onPageContent',
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
    constructor(baseUrlWrapper, options) {
        var _a;
        this.defaultOptions = {
            followSearchParams: true,
            uniqueParams: ['page'],
        };
        this.urlsToParse = {};
        this.alreadyParsedUrls = [];
        this.pageWrapper = new PageWrapper_1.PageWrapper();
        this.options = Object.assign(Object.assign({}, this.defaultOptions), options);
        this.baseUrlWrapper = baseUrlWrapper;
        // Prepare options.
        this.initBaseUrl(baseUrlWrapper.url.toString());
        // Emit.
        WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.createCrawl, { crawler: this, baseUrl: this.baseUrlWrapper });
        // Prepare storage.
        (_a = WebAuditConfig_1.WebAuditConfig.storage) === null || _a === void 0 ? void 0 : _a.installStore('page_found', WebAuditContext_1.WebAuditContext.current, {
            url: 'Referenced url',
            status: `Status`,
            size: `Content length`,
            final: 'Final URL (if redirected)',
            source: `Orignal page (where url is referenced)`,
        });
    }
    /**
     * Crawl url.
     */
    crawl(journey) {
        return __awaiter(this, void 0, void 0, function* () {
            // Init puppeteer browser.
            yield this.pageWrapper.newPage();
            yield journey.beforeAll(this.pageWrapper, [this.baseUrlWrapper]);
            yield this.crawlUrl(this.baseUrlWrapper.url, null, journey);
            yield this.pageWrapper.close();
        });
    }
    /**
     * Crawl url.
     *
     * @param {UrlWrapper} url
     * @private
     */
    crawlUrl(url, source = null, journey) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAlreadyParsed(url)) {
                return Promise.resolve();
            }
            WebAuditContext_1.WebAuditContext.current.setData('Page crawled').setUrl(url);
            // Get info.
            const pageInfo = yield this.getPageInfo(this.pageWrapper, url, source, journey);
            const eventData = { crawler: this, data: pageInfo, baseUrl: this.baseUrlWrapper, pageWrapper: this.pageWrapper };
            // Add to parsed urls.
            this.addToParsedUrls(pageInfo.url);
            this.addToParsedUrls(pageInfo.final);
            this.addToParsedUrls(pageInfo.source);
            if (pageInfo.log) {
                WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onPageCrawled, eventData);
                (_a = WebAuditConfig_1.WebAuditConfig.storage) === null || _a === void 0 ? void 0 : _a.add('page_found', WebAuditContext_1.WebAuditContext.current, pageInfo);
                if (pageInfo.status >= 300 && pageInfo < 400) {
                    WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onPageCrawledRedirected, eventData);
                }
                if (pageInfo.crawl) {
                    yield this.crawlSubPages(this.pageWrapper, pageInfo.final, journey);
                }
            }
            return Promise.resolve();
        });
    }
    /**
     * Return page info.
     *
     * @param {PageWrapper} pageWapper
     * @param {UrlWrapper} inputUrl
     * @param {UrlWrapper | null} source
     * @returns {Promise<any>}
     * @private
     */
    getPageInfo(pageWapper, inputUrl, source, journey) {
        return __awaiter(this, void 0, void 0, function* () {
            const infos = {
                url: inputUrl.toString(),
                source: (source === null || source === void 0 ? void 0 : source.toString()) || '',
                status: '',
                size: '',
                final: '',
                crawl: true,
                log: true,
            };
            // Check eligibility.
            const beforeCrawl = yield journey.isEligible(pageWapper, new UrlWrapper_1.UrlWrapper(inputUrl));
            if (!beforeCrawl) {
                infos.crawl = false;
                infos.log = false;
                return infos;
            }
            WebAuditConfig_1.WebAuditConfig.logger.message(`Parse : ${inputUrl.toString()}`);
            // Listen data.
            let status = '';
            let size = '';
            const onResponse = (response) => __awaiter(this, void 0, void 0, function* () {
                if (status === '') {
                    // eslint-disable-next-line require-atomic-updates
                    status = yield response.status();
                }
                if (size === '') {
                    try {
                        // eslint-disable-next-line require-atomic-updates
                        size = (yield response.buffer()).length;
                    }
                    catch (error) {
                        // Redirect has no size.
                    }
                }
            });
            this.pageWrapper.page.on('response', onResponse);
            // Navigate to page.
            try {
                yield this.pageWrapper.goto(inputUrl.toString());
            }
            catch (error) {
                WebAuditConfig_1.WebAuditConfig.logger.error(error);
                return Promise.resolve(infos);
            }
            try {
                yield this.pageWrapper.page.waitForSelector('body');
            }
            catch (err) {
                WebAuditConfig_1.WebAuditConfig.logger.error(`Load timeout`);
            }
            // Remove listeneer data.
            this.pageWrapper.page.off('response', onResponse);
            infos.status = status;
            infos.size = size;
            infos.final = (yield pageWapper.page.url()) || '';
            return infos;
        });
    }
    /**
     * Crawl inner href.
     *
     * @param {PageWrapper} pageWrapper
     * @param {URL} source
     * @param journey
     * @returns {Promise<void>}
     * @private
     */
    crawlSubPages(pageWrapper, source, journey) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get
            const hrefs = [];
            const links = yield pageWrapper.page.$$('a[href], link[rel="alternate"]');
            // Clean href links.
            for (const link of links) {
                try {
                    const href = yield (yield link.getProperty('href')).jsonValue();
                    const cleanURL = this.getCleanUrlFromHref(href, source);
                    if (cleanURL) {
                        hrefs.push(cleanURL);
                    }
                }
                catch (error) {
                    // Bad URL.
                }
            }
            const subUrls = this.getEligibleUrls(hrefs);
            WebAuditEvent_1.WebAuditEvent.emit(exports.WebAuditCrawlerEvents.onCrawlUrls, { crawler: this, urlsList: subUrls, baseUrl: this.baseUrlWrapper });
            for (const url of subUrls) {
                yield this.crawlUrl(url, source, journey);
            }
        });
    }
    /**
     * Clean base url.
     *
     * @private
     */
    initBaseUrl(url) {
        try {
            this.options.baseUrl = new URL(url);
            // define domain
            this.options.domain = new URL(url);
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
     * Return true if url is already queued.
     *
     * @param url
     * @private
     */
    isAlreadyAddedToQueue(url) {
        return typeof this.urlsToParse[this.normalizeURL(url)] !== 'undefined';
    }
    /**
     * Return only crawl eligible urls.
     *
     * @param urls
     * @private
     */
    getEligibleUrls(urls) {
        let eligibleUrls = urls.filter((url) => {
            return (!this.isAlreadyAddedToQueue(url) &&
                !this.isAlreadyParsed(url) &&
                this.isDomainUrl(url) &&
                // this.isHtmlUrl(url) &&
                this.isUserEligible(url));
        });
        if (eligibleUrls.length > 1) {
            eligibleUrls = eligibleUrls
                .map((url) => new URL(`${url.protocol}//${this.normalizeURL(url)}`))
                .filter((url) => url);
            eligibleUrls = this.uniqueUrls(eligibleUrls);
        }
        return eligibleUrls;
    }
    /**
     * Test if url is already parsed.
     *
     * @param {URL} url
     * @returns {boolean}
     * @private
     */
    isAlreadyParsed(url) {
        return this.alreadyParsedUrls.indexOf(this.normalizeURL(url)) > -1;
    }
    /**
     * Add url to already parsed.
     *
     * @param {URL} url
     * @private
     */
    addToParsedUrls(url) {
        if (url && !this.isAlreadyParsed(url)) {
            this.alreadyParsedUrls.push(this.normalizeURL(url));
        }
    }
    /**
     * Return true if url is eligible from user callback.
     *
     * @param url
     * @private
     */
    isUserEligible(url) {
        return this.options.isEligibleUrl ? this.options.isEligibleUrl(url, this) : true;
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
            if (origin && input.length > 1) {
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
    /**
     * Normalise url
     *
     * @param {URL} url
     * @returns {string}
     */
    normalizeURL(url) {
        var _a, _b;
        const idURL = new URL(url);
        idURL.hash = '';
        idURL.protocol = '';
        if (!this.options.followSearchParams) {
            idURL.search = '';
        }
        const uniqueParams = this.options.uniqueParams || [];
        if ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.uniqueParams) === null || _b === void 0 ? void 0 : _b.length) {
            Array.from(idURL.searchParams)
                .filter(([key]) => uniqueParams.indexOf(key) < 0)
                .forEach(([key]) => {
                idURL.searchParams.delete(key);
            });
        }
        // Delete protocole.
        let id = idURL
            .toString()
            .replace(`${idURL.protocol}//`, '');
        // Delete //.
        while (id.indexOf('//') > -1) {
            id = id.replace(/\/\//g, '/');
        }
        // Delete last /.
        while (id[id.length - 1] === '/') {
            id = id.slice(0, -1);
        }
        return id;
    }
}
exports.WebAuditCrawler = WebAuditCrawler;
