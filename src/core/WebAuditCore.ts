import {ModuleInterface} from '../modules/ModuleInterface';
import {WebAuditCrawler} from '../crawlers/Crawler';

import {WebAuditContext as Context} from './WebAuditContext';
import {WebAuditConfig} from './WebAuditConfig';

/**
 * Web Audit core main entry point for web audition.
 */
export class WebAuditCoreClass {

  events: any = {
    beforeCrawlWebsite: 'core_beforeCrawlWebsite',
  };

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
  public async analyseUrls(urls: URL[], modules: ModuleInterface[]) {
    // Define context.
    Context.current.setId('Analyse').setUrl().setData();

    // Init modules.
    for (const module of modules) {
      await module.init(WebAuditConfig, Context.current);
    }

    // Parse urls.
    for (const url of urls) {
      // TODO : optimize async.
      for (const module of modules) {
        Context.current.setData(module?.name);
        await module.analyse(url);
      }
    }

    // Close modules.
    for (const module of modules) {
      await module.finish();
    }
  }
}
