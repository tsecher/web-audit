import {HTTPResponse} from 'puppeteer';

import {UrlWrapper} from '##/core/UrlWrapper';
import {PageWrapper} from '##/journey/PageWrapper';
import {JourneyInterface} from '##/journey/JourneyInterface';
import {WebAuditContextClass} from '##/core/WebAuditContext';
import {StoredInterface} from "##/storage/StoredInterface";

export interface WebAuditCrawlerType {
    baseUrl: URL;
    domain?: URL;
    crawlerOptions?: any;
    allowedStatus?: number[];
    followSearchParams?: boolean;
    uniqueParams?: string[];
}

/**
 * Events.
 *
 * @type {{onCreateCrawl: string}}
 */
export const WebAuditCrawlerEvents: any = {
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
    onCrawlUrlsEnd: 'crawler__onCrawlUrlsEnd',
};

/**
 * Web audit crawler interface.
 */
export interface WebAuditCrawlerInterface {

    /**
     * Crawl action.
     */
    crawl(journey: JourneyInterface): Promise<void>;
}

/**
 * Website crawler.
 */
export class WebAuditCrawler implements WebAuditCrawlerInterface, StoredInterface {

    static id = 'default';
    static label = 'Default crawler';

    protected defaultOptions: any = {
        followSearchParams: true,
        uniqueParams: ['page'],
    };

    private options: WebAuditCrawlerType;

    private urlsToParse: any = {};

    private alreadyParsedUrls: string[] = [];

    private pageWrapper: PageWrapper;

    private statusSummary: any = {};

    /**
     * Constructor.
     *
     * @param eventEmitter
     * @param baseUrlWrapper
     * @param options
     */
    constructor(
        protected context: WebAuditContextClass,
        public baseUrlWrapper: UrlWrapper,
        options?: WebAuditCrawlerType,
    ) {
        this.options = {
            ...this.defaultOptions,
            ...options,
        };
        this.pageWrapper = new PageWrapper(this.context);

        // Prepare options.
        this.initBaseUrl(baseUrlWrapper.url.toString());

        // Emit.
        this.context.eventBus.emit(WebAuditCrawlerEvents.createCrawl, {crawler: this, baseUrl: this.baseUrlWrapper});

        // Prepare storage.
        this.context.config.storage?.installSchema(this, this.context);
    }

    get id(): string {
        return `crawl`;
    }


    /**
     * Crawl url.
     */
    async crawl(journey: JourneyInterface): Promise<void> {
        this.statusSummary = {};
        // Init puppeteer browser.
        await this.pageWrapper.newPage();

        await journey.beforeAll(this.pageWrapper, [this.baseUrlWrapper]);

        await this.crawlUrl(this.baseUrlWrapper.url, null, journey);

        await this.pageWrapper.close();

        this.summary();
    }

    /**
     * Summary log.
     */
    summary() {
        const total = Object.values(this.statusSummary).reduce((previous: any, current: any) => {
            return previous + current;
        }, 0);
        this.context.config.logger.result('Crawl', {
            ...this.statusSummary,
            ...{
                Total: total,
            },
        });
    }

    /**
     * Crawl url.
     *
     * @param {UrlWrapper} url
     * @private
     */
    private async crawlUrl(url: URL, source: URL | null = null, journey: JourneyInterface): Promise<void> {
        if (this.isAlreadyParsed(url)) {
            return Promise.resolve();
        }

        this.context.setData('Page crawled').setUrl(url);

        // Get info.
        let pageInfo: any;
        try {
            pageInfo = await this.getPageInfo(this.pageWrapper, url, source, journey);
        } catch (error) {
            return Promise.resolve();
        }

        const eventData = {crawler: this, data: pageInfo, baseUrl: this.baseUrlWrapper, pageWrapper: this.pageWrapper};

        // Add to parsed urls.
        this.addToParsedUrls(pageInfo.url);
        this.addToParsedUrls(pageInfo.final);
        this.addToParsedUrls(pageInfo.source);

        if (pageInfo.log) {
            this.context.eventBus.emit(WebAuditCrawlerEvents.onPageCrawled, eventData);
            this.context.config.storage?.add(this, 'pages', this.context, pageInfo);

            this.statusSummary[pageInfo.status] = (this.statusSummary[pageInfo.status] || 0) + 1;

            if (pageInfo.status >= 300 && pageInfo < 400) {
                this.context.eventBus.emit(WebAuditCrawlerEvents.onPageCrawledRedirected, eventData);
            }

            if (pageInfo.crawl) {
                await this.crawlSubPages(this.pageWrapper, pageInfo.final, journey);
            }
        }

        return Promise.resolve();
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
    private async getPageInfo(pageWapper: PageWrapper, inputUrl: URL, source: URL | null, journey: JourneyInterface): Promise<any> {
        const infos: any = {
            url: inputUrl.toString(),
            source: source?.toString() || '',
            status: '',
            size: '',
            final: '',
            crawl: true,
            log: true,
        };

        // Check eligibility.
        const beforeCrawl = await journey.isEligible(pageWapper, new UrlWrapper(inputUrl));
        if (!beforeCrawl) {
            infos.crawl = false;
            infos.log = false;
            return infos;
        }

        this.context.config.logger.message(`Parse : ${inputUrl.toString()}`);

        // Listen data.
        let status: number | string = '';
        let size: number | string = '';
        const onResponse = async (response: HTTPResponse) => {
            if (status === '') {
                // eslint-disable-next-line require-atomic-updates
                status = await response.status();
            }

            if (size === '') {
                try {
                    // eslint-disable-next-line require-atomic-updates
                    size = (await response.buffer()).length;
                } catch (error) {
                    // Redirect has no size.
                }
            }
        };

        this.pageWrapper.page.on('response', onResponse);

        // Navigate to page.
        try {
            await this.pageWrapper.goto(inputUrl.toString(), true);
        } catch (error) {
            this.context.config.logger.error(error);
            this.pageWrapper.page.off('response', onResponse);
            return Promise.resolve(infos);
        }

        try {
            await this.pageWrapper.page.waitForSelector('body');
        } catch (err) {
            this.context.config.logger.error(`Load timeout`);
        }

        // Remove listeneer data.
        this.pageWrapper.page.off('response', onResponse);


        infos.status = status;
        infos.size = size;
        infos.final = await pageWapper.page.url() || '';
        return infos;
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
    private async crawlSubPages(pageWrapper: PageWrapper, source: URL, journey: JourneyInterface) {
        // Get
        const hrefs: URL[] = [];
        const links = await pageWrapper.page.$$('a[href], link[rel="alternate"]');

        // Clean href links.
        for (const link of links) {
            try {
                const href = await (await link.getProperty('href')).jsonValue();
                const cleanURL = this.getCleanUrlFromHref(href, source);
                if (cleanURL) {
                    hrefs.push(cleanURL);
                }
            } catch (error) {
                // Bad URL.
            }
        }

        const subUrls = this.getEligibleUrls(hrefs);
        this.context.eventBus.emit(WebAuditCrawlerEvents.onCrawlUrls, {
            crawler: this,
            urlsList: subUrls,
            baseUrl: this.baseUrlWrapper,
        });
        for (const url of subUrls) {
            await this.crawlUrl(url, source, journey);
        }
    }

    /**
     * Clean base url.
     *
     * @private
     */
    private initBaseUrl(url: string) {
        try {
            this.options.baseUrl = new URL(url);

            // define domain
            this.options.domain = new URL(url);
            this.options.domain.hash = '';
            this.options.domain.pathname = '';
            this.options.domain.search = '';
        } catch (erro) {
            this.context.config.logger.exit(`Base URL is not of type URL`);
        }
    }

    /**
     * Parse only domain url.
     *
     * @param url
     * @private
     */
    private isDomainUrl(url: URL): boolean {
        return url.host === this.options.baseUrl.host;
    }

    /**
     * Return true if url is already queued.
     *
     * @param url
     * @private
     */
    private isAlreadyAddedToQueue(url: URL) {
        return typeof this.urlsToParse[this.normalizeURL(url)] !== 'undefined';
    }

    /**
     * Return only crawl eligible urls.
     *
     * @param urls
     * @private
     */
    private getEligibleUrls(urls: URL[]) {
        let eligibleUrls: URL[] = urls.filter((url) => {
            return (
                !this.isAlreadyAddedToQueue(url) &&
                !this.isAlreadyParsed(url) &&
                this.isDomainUrl(url) &&
                // this.isHtmlUrl(url) &&
                this.isUserEligible(url)
            );
        });

        if (eligibleUrls.length > 1) {
            eligibleUrls = eligibleUrls
                .map((url: URL) => new URL(`${url.protocol}//${this.normalizeURL(url)}`))
                .filter((url: URL) => url);
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
    private isAlreadyParsed(url: URL) {
        return this.alreadyParsedUrls.indexOf(this.normalizeURL(url)) > -1;
    }

    /**
     * Add url to already parsed.
     *
     * @param {URL} url
     * @private
     */
    private addToParsedUrls(url: URL | null) {
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
    private isUserEligible(url: URL) {
        if (typeof this.context.config.AppConfig.getConfig().crawler?.isEligibleUrl !== 'undefined') {
            return this.context.config.AppConfig.getConfig().crawler.isEligibleUrl(url, this, this.context)
        }
        return true;
    }

    /**
     * To readable urls.
     *
     * @param urls
     * @private
     */
    private readable(urls: URL[]) {
        return urls.map((url) => url.toString());
    }

    /**
     * Unique urls.
     *
     * @param urls
     * @private
     */
    private uniqueUrls(urls: URL[]) {
        const count: any = {};
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
    private getCleanUrlFromHref(href: string, origin: URL | null) {
        let input = href;

        // Deal with anchor.
        if (input.indexOf('#') === 0) {
            return null;
        }

        // Deal with relative href.
        if (input.indexOf('/') === 0 && input.length > 1) {
            input = `${this.options.domain?.toString()}${input}`;
        }

        // Deal with parameters urls.
        if (this.options.followSearchParams && input.indexOf('?') === 0) {
            if (origin && input.length > 1) {
                const url = new URL(origin);
                url.search = input;
                input = url.toString();
            } else {
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
    private normalizeURL(url: URL): string {
        const idURL: URL = new URL(url);
        idURL.hash = '';
        idURL.protocol = '';

        if (!this.options.followSearchParams) {
            idURL.search = '';
        }

        const uniqueParams: string[] = this.options.uniqueParams || [];
        if (this.options?.uniqueParams?.length) {
            Array.from(idURL.searchParams)
                .filter(([key]) => uniqueParams.indexOf(key) < 0)
                .forEach(([key]) => {
                    idURL.searchParams.delete(key);
                });
        }

        // Delete protocole.
        let id: string = idURL
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

    getSchema(): any {
        return {
            "id": "crawler",
            "label": "Crawler",
            "description": "The crawler retreives static published page information",
            "structure": {
                "pages": {
                    "label": "Pages found",
                    "description": "The list of paged found by crawl",
                    "structure": {
                        "url": {
                            "label": "Referenced url",
                            "description": "The exposed URL",
                            "type": "string"
                        },
                        "status": {
                            "label": "Status",
                            "description": "The status code of the response",
                            "type": "number"
                        },
                        "size": {
                            "label": "Content length (KB)",
                            "description": "The response size.",
                            "type": "number"
                        },
                        "final": {
                            "label": "Final URL (if redirected)",
                            "description": "The final URL (after redirections)",
                            "type": "string"
                        },
                        "source": {
                            "label": "Orignal page (where url is referenced)",
                            "description": "The source page, where the url was first found.",
                            "type": "string"
                        },
                    }
                }
            }
        };
    }

}
