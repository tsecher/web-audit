import {WebAuditConfig as Config} from '../core/WebAuditConfig';
import {WebAuditContext as Context} from '../core/WebAuditContext';
import {WebAuditEvent as Event} from '../core/WebAuditEvent';

const Crawler = require('crawler');

export interface WebAuditCrawlerType {
  baseUrl: URL;
  domain?: URL;
  crawlerOptions?: any;
  allowedStatus?: number[];
  followSearchParams?: boolean;
  isEligibleUrl?: Function;
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
};

/**
 * Website crawler.
 */
export class WebAuditCrawler {

  protected defaultOptions: any = {
    crawlerOptions: {
      maxConnections: 10,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
      retries: 0,
    },
    allowedStatus: [200, 201, 202, 203, 204],
    followSearchParams: true,
    uniqueParams: ['page'],
  };

  private options: WebAuditCrawlerType;

  private parsedUrls: any = {};

  private crawler?: any;

  private onDone?: Function;

  /**
   * Constructor.
   *
   * @param options
   */
  constructor(options?: WebAuditCrawlerType) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    };

    // Prepare options.
    this.cleanBaseUrl();

    // Emit.
    Event.emit(WebAuditCrawlerEvents.createCrawl, {crawler: this});

    // Prepare storage.
    Config.storage?.installStore(
      'page_found',
      Context.current,
      {
        url: 'Referenced url',
        status: `Status`,
        size: `Content length`,
        parsedUrl: 'Final URL (if redirected)',
        origin: `Orignal page (where url is referenced)`,
      },
    );
  }

  /**
   * Crawl url.
   */
  crawl() {
    // Define crawler.
    this.crawler = new Crawler(this.options.crawlerOptions);
    Event.emit(WebAuditCrawlerEvents.beforeCrawl, {crawler: this});
    this.crawler.on('drain', () => {
      if (this.onDone) {
        this.onDone(this.parsedUrls);
        Event.emit(WebAuditCrawlerEvents.afterCrawl, {crawler: this});
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
  private crawlUrls(urls: URL[], origin?: URL) {
    // Filter eligible urls (html, domain and not already crawled).
    const eligibleUrls = this.getEligibleUrls(urls);

    Event.emit(WebAuditCrawlerEvents.onCrawlUrls, {crawler: this, urlsList: urls});

    // Add new urls to queue
    if (eligibleUrls.length) {
      this.addToParsedUrls(eligibleUrls);

      this.crawler.queue(
        eligibleUrls.map((url) => {
          return {
            uri: url.toString(),
            callback: (error: any, res: any, done: Function) => this.onPageCrawled(error, res, done, url, origin),
          };
        }),
      );
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
  private onPageCrawled(error: any, res: any, done: Function, url: URL, origin?: URL) {
    Context.current.setData('Page crawled').setUrl(url);
    const eventData: any = {error: error, res: res, url: url, origin: origin};

    Event.emit(WebAuditCrawlerEvents.onPageCrawled, {crawler: this, data: eventData});

    // Error.
    if (error) {
      Config.logger.error(error);
      Event.emit(WebAuditCrawlerEvents.onPageCrawledError, {crawler: this, data: eventData});
      done();
      return;
    }

    // Status.
    if (this.options.allowedStatus && this.options.allowedStatus?.indexOf(res.statusCode) < 0) {
      Config.logger.warning(`Url respond with status ${res.statusCode}. ${origin ? `Found in ${origin}` : ''}`);
      Event.emit(WebAuditCrawlerEvents.onPageCrawledBadStatus, {crawler: this, data: eventData});
      done();
      return;
    }

    // No returned uri.
    if (!res.request?.uri.href) {
      Config.logger.error(`No uri`);
      Event.emit(WebAuditCrawlerEvents.onPageCrawledNoUri, {crawler: this, data: eventData});
      done();
      return;
    }

    const parsedUrl: URL = new URL(res.request.uri.href);
    const gotRedirected: boolean = parsedUrl.toString() !== url.toString();

    // Store found page.
    const _parsedUrl = gotRedirected ? parsedUrl : null;

    Config.storage?.add('page_found', Context.current, {
      url,
      _parsedUrl,
      origin,
      status: res.statusCode,
      size: res.headers['content-length'],
    });

    // Redirection
    if (gotRedirected) {
      Config.logger.warning(`Got redirected from ${url.toString()} to ${parsedUrl.toString()}`);
      Event.emit(WebAuditCrawlerEvents.onPageCrawledRedirected, {crawler: this, data: eventData});
    }

    // Parse content.
    try {
      Config.logger.message(`Parsing ${parsedUrl}`);
      eventData.res = res;
      Event.emit(WebAuditCrawlerEvents.onPageContent, {crawler: this, data: eventData});
      this.crawlUrls(this.getUrlsInBody(res.$, parsedUrl), parsedUrl);
    } catch (error) {
      Config.logger.warning(error);
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
    const urls: URL[] = [];

    if (!$) {
      return urls;
    }

    $('a[href], link[rel="alternate"]').each((i: any, link: any) => {
      const href = $(link).attr('href');

      try {
        const url = this.getCleanUrlFromHref(href, origin);
        if (url) {
          urls.push(url);
        }
      } catch (error) {
        Config.logger.warning(`Not a valid url ${href}`);
      }
    });

    return this.getEligibleUrls(urls);
  }

  /**
   * Clean base url.
   *
   * @private
   */
  private cleanBaseUrl() {
    try {
      this.options.baseUrl = new URL(this.options.baseUrl);

      // define domain
      this.options.domain = new URL(this.options.baseUrl);
      this.options.domain.hash = '';
      this.options.domain.pathname = '';
      this.options.domain.search = '';

    } catch (erro) {
      Config.logger.exit(`Base URL is not of type URL`);
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
   * Return true if url is eligible (may be HMTL extension)
   *
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
   * Return true if url is already queued.
   *
   * @param url
   * @private
   */
  private isAlreadyParsed(url: URL) {
    return typeof this.parsedUrls[this.normalizeURL(url)] !== 'undefined';
  }

  /**
   * Add Url to parsed URLS.
   * @param url
   * @private
   */
  private addToParsedUrl(url: URL) {
    if (!this.isAlreadyParsed(url)) {
      this.parsedUrls[this.normalizeURL(url)] = url;
    }
  }

  /**
   * Add urls to parsed urls.
   *
   * @param urls
   * @private
   */
  private addToParsedUrls(urls: URL[]) {
    urls.forEach((url) => this.addToParsedUrl(url));
  }

  /**
   * Return only crawl eligible urls.
   *
   * @param urls
   * @private
   */
  private getEligibleUrls(urls: URL[]) {
    let eligibleUrls = urls.filter((url) => {
      return (
        !this.isAlreadyParsed(url) &&
        this.isDomainUrl(url) &&
        this.isHtmlUrl(url) &&
        this.isUserEligible(url)
      );
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
  private isUserEligible(url: URL) {
    return this.options.isEligibleUrl ? this.options.isEligibleUrl(url) : true;
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
  private getCleanUrlFromHref(href: string, origin: URL) {
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
      if (input.length > 1) {
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
}
