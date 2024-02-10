import {MODULE_TYPES, ModuleEvents, ModuleInterface} from '##/modules/ModuleInterface';
import {WebAuditCrawler, WebAuditCrawlerEvents} from '##/crawlers/Crawler';
import {AbstractDomainModule} from '##/domain/AbstractDomainModule';
import {AbstractPuppeteerJourneyModule} from '##/journey/AbstractPuppeteerJourneyModule';
import {PageWrapper} from '##/journey/PageWrapper';
import {JourneyInterface} from '##/journey/JourneyInterface';
import {UrlWrapper} from '##/core/UrlWrapper';
import {WebAuditContextClass} from '##/core/WebAuditContext';

/**
 * Web Audit core main entry point for web audition.
 */
export class WebAuditCoreClass {

  constructor(
    public context: WebAuditContextClass,
  ) {
  }

  /**
   * Craw website.
   *
   * @param crawlerClass
   * @param baseUrlWrapper
   * @param journey
   * @param options
   */
  public async crawlWebsite(CrawlerClass: any, baseUrlWrapper: UrlWrapper, journey: JourneyInterface, options: any = {}): Promise<void> {
    // Define context.
    this.context.setId('Crawl')
      .setUrl(baseUrlWrapper.url);

    // Crawl domain.
    options.baseUrl = baseUrlWrapper.url;

    const crawler = new CrawlerClass(this.context, baseUrlWrapper, options);
    await crawler.crawl(journey);
    this.context.eventBus.emit(WebAuditCrawlerEvents.onCrawlUrlsEnd, {crawler: crawler, core: this});
  }

  /**
   * Audit urls.
   *
   * @param urls
   * @param modules
   * @param journey
   */
  public async analyseUrls(urls: UrlWrapper[], modules: ModuleInterface[], journey: JourneyInterface) {
    // Define context.
    this.context.setId('Analyse')
      .setUrl()
      .setData();

    const modulesTypes: any = {};

    // Init and sort modules by types (puppeteer or default).
    for (const module of modules) {
      modulesTypes[module.type] = modulesTypes[module.type] || [];
      modulesTypes[module.type].push(module);

      await module.init(this.context);
    }

    // Analyse before modules.
    await this.analyseModules(modulesTypes[MODULE_TYPES.BEFORE], urls);

    // Analyse standard modules.
    await this.analyseModules(modulesTypes[MODULE_TYPES.STANDARD], urls);

    // Analyse journey modules.
    try {
      if (modulesTypes[MODULE_TYPES.JOURNEY] && modulesTypes[MODULE_TYPES.JOURNEY].length) {
        await this.analyseJourneyModules(modulesTypes[MODULE_TYPES.JOURNEY], urls, journey);
      }
    } catch (err) {
      console.log(err);
    }

    // Close modules.
    for (const module of modules) {
      await module.finish();
    }
  }

  /**
   * Analyse default modules.
   *
   * @param modules
   * @param {UrlWrapper[]} urls
   * @returns {Promise<void>}
   * @private
   */
  private async analyseModules(modules: ModuleInterface[] = [], urls: UrlWrapper[]) {
    // Parse urls.
    for (const url of urls) {
      this.context.eventBus.emit(ModuleEvents.beforeUrlProcess, {module: this, url: url});

      for (const module of modules) {
        this.context.setData(module?.name);
        await module.analyse(url);
      }
      this.context.eventBus.emit(ModuleEvents.afterUrlProcess, {module: this, url: url});
    }
  }

  /**
   * Analyse default modules.
   *
   * @param modules
   * @param {UrlWrapper[]} urls
   * @param journey
   * @returns {Promise<void>}
   * @private
   */
  private async analyseJourneyModules(modules: AbstractPuppeteerJourneyModule[] = [], urls: UrlWrapper[], journey: JourneyInterface) {
    const pageWrapper = new PageWrapper(this.context);

    journey.context = this.context;
    await journey.beforeAll(pageWrapper, urls);

    // Init journey.
    for (const module of modules) {
      this.context.setData(module?.name);
      await module.initJourney(journey);
    }

    // Parse urls.
    for (const url of urls) {
      this.context.config.logger.success(`URL : ${url.url.toString()}`);
      await pageWrapper.newPage();

      await journey.beforeEach(pageWrapper, url);

      this.context.eventBus.emit(ModuleEvents.beforeUrlProcess, {module: this, url: url});

      // Play journey.
      this.context.setData(journey.name);
      await journey.play(pageWrapper, url);

      // Analyse journey after collecting data in journey.
      for (const module of modules) {
        this.context.setData(module?.name);
        await module.analyse(url);
      }

      this.context.eventBus.emit(ModuleEvents.afterUrlProcess, {module: this, url: url});
    }

    await pageWrapper.close();
  }

}
