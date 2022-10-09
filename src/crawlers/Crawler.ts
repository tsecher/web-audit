import {WebAuditConfig as Config} from "../core/WebAuditConfig";
import {WebAuditContext as Context} from "../core/WebAuditContext";

const Crawler = require('crawler')

export type WebAuditCrawlerType = {
    base_url: URL,
    domain?: URL,
    crawler_options?: any,
    allowed_status?: Array<number>,
}

/**
 * Website crawler.
 */
export class WebAuditCrawler {

    private options: WebAuditCrawlerType;

    private parsed_urls: Array<URL> = [];

    private crawler?: any;

    private onDone?: Function;

    protected defaultOptions: any = {
        crawler_options: {
            maxConnections: 10,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
            retries: 0,
        },
        allowed_status: [200, 201, 202, 203, 204]
    }

    constructor(options?: WebAuditCrawlerType) {
        this.options = {
            ...this.defaultOptions,
            ...options,
        }

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
        })
    }

    /**
     * Crawl a page.
     *
     * @param urls
     * @param origin
     * @private
     */
    private crawlUrls(urls: Array<URL>, origin?: URL) {
        // Filter eligible urls (html, domain and not already crawled).
        const eligible_urls = this.getEligibleUrls(urls);
        this.addToParsedUrls(eligible_urls);

        // Add new urls to queue
        if (eligible_urls.length) {
            this.crawler.queue(
                eligible_urls.map(url => {
                    return {
                        'uri': url.toString(),
                        'callback': (error: any, res: any, done: Function) => this.onPageCrawled(error, res, done, url, origin)
                    }
                })
            )
        }
    }

    /**
     * Parse only domain url.
     *
     * @param url
     * @private
     */
    private isDomainUrl(url: URL): boolean {
        return url.host === this.options.base_url.host;
    }

    /**
     * Return true if url is eligible (may be HMTL extension)
     * @param url
     * @private
     */
    private isHtmlUrl(url: URL): boolean {
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
    private onPageCrawled(error: any, res: any, done: Function, url: URL, origin?: URL) {
        Context.current.setData('Page crawled').setUrl(url)

        // Error.
        if (error) {
            Config.logger.error(error);
            done();
        }

        // Status.
        // @ts-ignore
        if (this.options.allowed_status.indexOf(res.statusCode) < 0) {
            Config.logger.warning(`Url respond with status ${res.statusCode}. ${origin ? `Found in ${origin}` : ''}`);
            done();
        }

        // No returned uri.
        if (!res.request?.uri.href) {
            Config.logger.error(`No uri`);
            done();
        }

        const parsed_url = new URL(res.request.uri.href);

        // Store found page.
        Config.storage?.add('page_found', Context.current, {
            url: url,
            parsed_url: parsed_url,
            origin: origin,
            status: res.statusCode
        })

        // Redirection
        if (parsed_url.toString() !== url.toString()) {
            Config.logger.warning(`Server redirection from ${url.toString()} to ${parsed_url.toString()}`);
        }

        // Parse content.
        try {
            Config.logger.message(`Parsing ${parsed_url}`);
            this.crawlUrls(this.getUrlsInBody(res.$, parsed_url));
        } catch (e) {
            Config.logger.warning(e);
        }

        done();
    }

    /**
     * Return all eligible url available in the body.
     *
     * @param $
     * @private
     */
    private getUrlsInBody($: any, origin: URL) {
        const urls: Array<URL> = [];

        if (!$) return urls;

        $('a[href], link[rel="alternate"]').each((i: any, link: any) => {
            let href = $(link).attr('href');

            try {
                urls.push(this.getCleanUrlFromHref(href, origin));
            } catch (e) {
                // Config.logger.warning(`Not a valid url ${href}`);
            }
        })

        return this.getEligibleUrls(urls);
    }

    /**
     * Clean base url.
     *
     * @private
     */
    private cleanBaseUrl() {
        try {
            this.options.base_url = new URL(this.options.base_url);

            // define domain
            this.options.domain = new URL(this.options.base_url);
            this.options.domain.hash = '';
            this.options.domain.pathname = '';
            this.options.domain.search = '';

        } catch (e) {
            Config.logger.exit(`Base URL is not of type URL`);
        }
    }

    /**
     * Return true if url is already queued.
     *
     * @param url
     * @private
     */
    private isAlreadyParsed(url: URL) {
        return this.parsed_urls.filter(parsed => {
            return parsed.toString().replace(parsed.hash, '') === url.toString().replace(url.hash, '')
        }).length;

    }

    /**
     * Add Url to parsed URLS.
     * @param url
     * @private
     */
    private addToParsedUrl(url: URL) {
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
    private addToParsedUrls(urls: Array<URL>) {
        urls.forEach(url => this.addToParsedUrl(url));
    }

    /**
     * Return only crawl eligible urls.
     *
     * @param urls
     * @private
     */
    private getEligibleUrls(urls: Array<URL>) {
        return urls.filter(url => !this.isAlreadyParsed(url) && this.isDomainUrl(url) && this.isHtmlUrl(url));
    }

    /**
     * To readable urls.
     *
     * @param urls
     * @private
     */
    private readable(urls: Array<URL>) {
        return urls.map(url => url.toString());
    }

    /**
     * Return clea url from href.
     *
     * @param href
     * @param origin
     * @private
     */
    private getCleanUrlFromHref(href: string, origin: URL) {
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