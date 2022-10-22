import {ModuleEvents, ModuleInterface} from '../modules/ModuleInterface';
import {WebAuditCrawler} from '../crawlers/Crawler';

import {WebAuditContext as Context} from './WebAuditContext';
import {WebAuditConfig} from './WebAuditConfig';
import {WebAuditEvent as Event} from './WebAuditEvent';
import {UrlWrapper} from './UrlWrapper';

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
  public async analyseUrls(urls: UrlWrapper[], modules: ModuleInterface[]) {
    // Define context.
    Context.current.setId('Analyse').setUrl().setData();

    // Init modules.
    for (const module of modules) {
      await module.init(WebAuditConfig, Context.current);
    }

    // Parse urls.
    for (const url of urls) {
      Event.emit(ModuleEvents.beforeUrlProcess, {module: this, url: url});
      // TODO : optimize async.
      for (const module of modules) {
        Context.current.setData(module?.name);
        await module.analyse(url);
      }
      Event.emit(ModuleEvents.afterUrlProcess, {module: this, url: url});
    }

    // Close modules.
    for (const module of modules) {
      await module.finish();
    }
  }
}
