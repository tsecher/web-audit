import {ModuleInterface} from '../modules/ModuleInterface';
import {WebAuditCrawler} from '../crawlers/Crawler';

import {WebAuditContext as Context} from './WebAuditContext';
import {WebAuditConfig} from './WebAuditConfig';

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

  /**
   * Audit urls.
   *
   * @param urls
   * @param modules
   */
  public analyseUrls(urls: URL[], modules: ModuleInterface[]) {
    // Define context.
    Context.current.setId('Crawl').setUrl().setData();

    // Init modules.
    modules.forEach((module) => module.init(WebAuditConfig, Context.current));

    // Parse urls.
    urls.forEach((url) => {
      Context.current.setUrl(url);

      // Prepare analyser.
      modules.forEach((module) => {
        Context.current.setData(module.name);
        module.analyse(url);
      });
    });
  }

}
