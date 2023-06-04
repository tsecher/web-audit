import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {AbstractPuppeteerJourneyModule} from '../../journey/AbstractPuppeteerJourneyModule';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '../../journey/AbstractPuppeteerJourney';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';
import {PageWrapper} from '../../journey/PageWrapper';
import {UrlWrapper} from '../../core/UrlWrapper';
import {ModuleEvents} from '../ModuleInterface';

const fs = require('fs');

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

  protected lighthouseReport: any;

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
  async init(config: Config, context: Context): Promise<any> {
    this.config = config;
    this.context = context;

    // Install lighthouse store.
    this.config.storage?.installStore('lighthouse', this.context, {
      url: 'Url',
      performance: 'Performance',
      seo: 'SEO',
      'best-practices': 'Best Practices', // eslint-disable-line @typescript-eslint/naming-convention
      accessibility: 'Accessibility',
    });

    // Emit.
    Event.emit(LighthouseModuleEvents.createLighthouseModule, {module: this});
  }

  /**
   * {@inheritdoc}
   */
  async analyse(urlWrapper: UrlWrapper): Promise<boolean> {

    // Report
    const report: any = {};
    this.getOptions()
      ?.onlyCategories
      ?.map((cat: any) => {
        try {
          report[cat] = this.lighthouseReport.report.categories[cat].score;
        } catch (error) {
          this.config?.logger.error(error);
        }
      });


    Event.emit(LighthouseModuleEvents.onResult, {module: this, url: urlWrapper, result: this.lighthouseReport});
    Event.emit(ModuleEvents.onAnalyseResult, {module: this, url: urlWrapper, result: this.lighthouseReport});

    if (report?.performance) {
      this.config?.logger.result(`Lighthouse`, report, urlWrapper.url.toString());
    } else {
      this.config?.logger.error(`Could not analyse page`);
      this.config?.logger.error(report);
    }

    report.url = urlWrapper.url.toString();
    this.config?.storage?.add('lighthouse', this.context, report);

    Event.emit(LighthouseModuleEvents.afterAnalyse, {module: this, url: urlWrapper});
    Event.emit(ModuleEvents.afterAnalyse, {module: this, url: urlWrapper});

    return true;
  }

  /**
   * Finish analyse process.
   *
   * @returns {Promise<any>}
   */
  async finish(): Promise<any> {
  }

  /**
   * {@inheritdoc}
   */
  initEvents(journey: AbstractPuppeteerJourney) {
    journey.on(PuppeteerJourneyEvents.JOURNEY_END, async (data: any) => this.launchLighthouse(data.wrapper));
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
    this.lighthouseReport = null;
    const browser = await wrapper.getBrowser();
    const endpoint = new URL(browser.wsEndpoint());

    const options = this.getOptions();
    options.port = endpoint.port;

    const result = await lighthouse(
      wrapper.page.url(),
      options,
      {extends: 'lighthouse:default'},
    );

    this.lighthouseReport = {
      report: JSON.parse(ReportGenerator.generateReport(result.lhr, 'json')),
      html: ReportGenerator.generateReport(result.lhr, 'html'),
    };
  }
}
