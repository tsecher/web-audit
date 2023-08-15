import {WebAuditContextClass} from '../../core/WebAuditContext';
import {AbstractPuppeteerJourneyModule} from '../../journey/AbstractPuppeteerJourneyModule';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '../../journey/AbstractPuppeteerJourney';
import {PageWrapper} from '../../journey/PageWrapper';
import {UrlWrapper} from '../../core/UrlWrapper';
import {ModuleEvents} from '../ModuleInterface';

const lighthouse = require('lighthouse');
const ReportGenerator = require('lighthouse/report/generator/report-generator');


/**
 * Lighthouse Module events.
 */

export const LighthouseModuleEvents: any = {
  createLighthouseModule: 'lighthouse_module__createLighthouseModule',
  beforeAnalyse: 'lighthouse_module__beforeAnalyse',
  onResult: 'lighthouse_module__onResult',
  onBrowserClose: 'lighthouse_module__onBrowserClose',
  onBrowserLaunch: 'lighthouse_module__onBrowserLaunch',
  onNewPage: 'lighthouse_module__onNewPage',
  afterAnalyse: 'lighthouse_module__afterAnalyse',
};

/**
 * W3c Validator.
 */
export class LighthouseModule extends AbstractPuppeteerJourneyModule {

  protected reports: any[] = [];

  protected defaultOptions?: any = {
    output: 'json',
    onlyCategories: ['performance', 'seo', 'best-practices', 'accessibility'],
  };

  get name(): string {
    return 'Google Lighthouse';
  }

  get id(): string {
    return `lighthouse`;
  }

  /**
   * {@inheritdoc}
   */
  async init(context: WebAuditContextClass): Promise<any> {
    this.context = context;

    // Install lighthouse store.
    this.context?.config.storage?.installStore('lighthouse', this.context, {
      url: 'Url',
      context: 'Context',
      performance: 'Performance',
      seo: 'SEO',
      'best-practices': 'Best Practices', // eslint-disable-line @typescript-eslint/naming-convention
      accessibility: 'Accessibility',
    });

    // Emit.
    this.context?.eventBus.emit(LighthouseModuleEvents.createLighthouseModule, {module: this});
  }

  /**
   * {@inheritdoc}
   */
  async analyse(urlWrapper: UrlWrapper): Promise<boolean> {
    this.reports.forEach((contextReport: any, index: number) => {
      if (!contextReport) {
        return;
      }

      // Report
      const report: any = {};
      report.context = this.journeyContexts[index].name;

      this.getOptions()
        ?.onlyCategories
        ?.map((cat: any) => {
          try {
            report[cat] = contextReport.report.categories[cat].score;
          } catch (error) {
            this.context?.config?.logger.error(error);
          }
        });

      this.context?.eventBus.emit(LighthouseModuleEvents.onResult, {
        module: this,
        url: urlWrapper,
        result: contextReport
      });
      this.context?.eventBus.emit(ModuleEvents.onAnalyseResult, {
        module: this,
        url: urlWrapper,
        result: contextReport
      });

      if (report?.performance) {
        this.context?.config?.logger.result(`Lighthouse`, report, urlWrapper.url.toString());
      } else {
        this.context?.config?.logger.error(`Could not analyse page`);
        this.context?.config?.logger.error(report);
      }

      report.url = urlWrapper.url.toString();
      this.context?.config?.storage?.add('lighthouse', this.context, report);

      this.context?.eventBus.emit(LighthouseModuleEvents.afterAnalyse, {module: this, url: urlWrapper});
      this.context?.eventBus.emit(ModuleEvents.afterAnalyse, {module: this, url: urlWrapper});
    });

    return true;
  }

  /**
   * {@inheritdoc}
   */
  initEvents(journey: AbstractPuppeteerJourney) {
    journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data: any) => {
      this.reports = [];
    });
    journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data: any) => this.launchLighthouse(data.wrapper));
  }

  /**
   * Laucnh lighthouse.
   *
   * @param {PageWrapper} wrapper
   *   Page wrapper.
   *
   * @returns {Promise<undefined>}
   *
   * @private
   */
  protected async launchLighthouse(wrapper: PageWrapper): Promise<any> {
    const browser = await wrapper.getBrowser();
    const endpoint = new URL(browser.wsEndpoint());

    const options = this.getOptions();
    options.port = endpoint.port;

    const result = await lighthouse(
      wrapper.page.url(),
      options,
      {extends: 'lighthouse:default'},
    );

    this.reports.push({
      report: JSON.parse(ReportGenerator.generateReport(result.lhr, 'json')),
      html: ReportGenerator.generateReport(result.lhr, 'html'),
    });
  }
}
