import {ModuleEvents, ModuleInterface} from '../modules/ModuleInterface';
import {WebAuditCrawler} from '../crawlers/Crawler';
import {AbstractPuppeteerJourneyModule} from '../journey/AbstractPuppeteerJourneyModule';
import {PageWrapper} from '../journey/PageWrapper';
import {JourneyInterface} from '../journey/JourneyInterface';

import {WebAuditContext as Context} from './WebAuditContext';
import {WebAuditConfig} from './WebAuditConfig';
import {WebAuditEvent as Event} from './WebAuditEvent';
import {UrlWrapper} from './UrlWrapper';

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
  public crawlWebsite(baseUrlWrapper: UrlWrapper, journey: JourneyInterface, options: any = {}): Promise<any> {
    // Define context.
    Context.current.setId('Crawl')
      .setUrl(baseUrlWrapper.url);

    // Crawl domain.
    options.baseUrl = baseUrlWrapper.url;
    const crawler = new WebAuditCrawler(baseUrlWrapper, options);
    return crawler.crawl(journey);
  }

  /**
   * Audit urls.
   *
   * @param urls
   * @param modules
   */
  public async analyseUrls(urls: UrlWrapper[], modules: ModuleInterface[], journey: JourneyInterface) {
    // Define context.
    Context.current.setId('Analyse')
      .setUrl()
      .setData();


    const defaultModules = [];
    const puppeteerJourneyModules = [];

    // Init and sort modules by types (puppeteer or default).
    for (const module of modules) {
      if (module instanceof AbstractPuppeteerJourneyModule) {
        puppeteerJourneyModules.push(module);
      } else {
        defaultModules.push(module);
      }
      await module.init(WebAuditConfig, Context.current);
    }

    // Analyser default module
    await this.analyseDefaultModules(defaultModules, urls);

    // Analyse puppeteer modules.
    try {
      await this.analysePuppeteerJourneyModules(puppeteerJourneyModules, urls, journey);
    } catch (err) {
      console.log(err);
      process.exit();
    }


    // Close modules.
    for (const module of modules) {
      await module.finish();
    }
  }

  /**
   * Analyse default modules.
   *
   * @param {ModuleInterface[]} defaultModules
   * @param {UrlWrapper[]} urls
   * @returns {Promise<void>}
   * @private
   */
  private async analyseDefaultModules(modules: ModuleInterface[], urls: UrlWrapper[]) {
    // Parse urls.
    for (const url of urls) {
      Event.emit(ModuleEvents.beforeUrlProcess, {module: this, url: url});

      for (const module of modules) {
        Context.current.setData(module?.name);
        await module.analyse(url);
      }
      Event.emit(ModuleEvents.afterUrlProcess, {module: this, url: url});
    }
  }

  /**
   * Analyse default modules.
   *
   * @param {ModuleInterface[]} defaultModules
   * @param {UrlWrapper[]} urls
   * @returns {Promise<void>}
   * @private
   */
  private async analysePuppeteerJourneyModules(modules: AbstractPuppeteerJourneyModule[], urls: UrlWrapper[], journey: JourneyInterface) {
    const pageWrapper = new PageWrapper();

    await journey.beforeAll(pageWrapper, urls);

    // Init journey.
    for (const module of modules) {
      Context.current.setData(module?.name);
      await module.initJourney(journey);
    }

    // Parse urls.
    for (const url of urls) {
      WebAuditConfig.logger.success(`URL : ${url.url.toString()}`);
      await pageWrapper.newPage();

      await journey.beforeEach(pageWrapper, url);

      Event.emit(ModuleEvents.beforeUrlProcess, {module: this, url: url});

      // Play journey.
      Context.current.setData(journey.name);

      await journey.play(pageWrapper, url);

      // Analyse journey after collecting data in journey.
      for (const module of modules) {
        Context.current.setData(module?.name);
        await module.analyse(url);
      }

      Event.emit(ModuleEvents.afterUrlProcess, {module: this, url: url});
    }

    await pageWrapper.close();
  }


}
