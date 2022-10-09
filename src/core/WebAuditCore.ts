import {WebAuditCrawler} from '../crawlers/Crawler';

import {WebAuditContext as Context} from './WebAuditContext';


/**
 * Web Audit core main entry point for web audition.
 */
export class WebAuditCoreClass {

  /**
   * Craw website.
   *
   * @param baseUrl
   * @param options
   */
  public crawlWebsite(baseUrl: URL, options: any = {}): Promise<any> {
    // Define context.
    Context.current.setId('Crawl').setUrl(baseUrl);

    // Crawl domain.
    options.baseUrl = baseUrl;
    const crawler = new WebAuditCrawler(options);
    return crawler.crawl();
  }
}
