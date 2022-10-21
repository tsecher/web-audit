import {ModuleEvents, ModuleInterface} from '../ModuleInterface';
import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';

const ChromeLauncher = require('chrome-launcher');
const lighthouse = require('lighthouse');

export const LighthouseModuleEvents: any = {
  createLighthouseModule: 'lighthouse_module__createLighthouseModule',
  beforeAnalyse: 'lighthouse_module__beforeAnalyse',
  onResult: 'lighthouse_module__onResult',
  onBrowserClose: 'lighthouse_module__onBrowserClose',
  onBrowserLaunch: 'lighthouse_module__onBrowserLaunch',
  onNewPage: 'lighthouse_module__onNewPage',
  afterAnalyse: 'lighthouse_module__afterAnalyse',
};

export class LighthouseModule implements ModuleInterface {

  get name(): string {
    return 'Google Lighthouse';
  }

  get id(): string {
    return `lighthouse`;
  }

  private options: any;

  private browser: any;

  private config?: Config;

  private context?: Context;

  private defaultOptions = {};

  constructor(
    userOptions: any = {},
  ) {
    // Build dependencies.
    this.options = {
      ...this.defaultOptions,
      ...userOptions,
    };
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
  async analyse(url: URL): Promise<any> {
    Event.emit(LighthouseModuleEvents.beforeAnalyse, {module: this, url: url});
    Event.emit(ModuleEvents.beforeAnalyse, {module: this, url: url});

    const browser = await this.getBrowser();

    const options = {
      output: 'json',
      onlyCategories: ['performance', 'seo', 'best-practices', 'accessibility'],
      port: browser.port,
    };

    const runnerResult = await lighthouse(url, options, {
      extends: 'lighthouse:default',
    });

    const result = JSON.parse(runnerResult.report);

    // Report
    const report: any = {};
    options.onlyCategories.map((cat) => {
      try {
        report[cat] = result.categories[cat].score;
      } catch (error) {
        this.config?.logger.error(error);
      }
    });

    Event.emit(LighthouseModuleEvents.onResult, {module: this, url: url, browser: browser, result: result});
    Event.emit(ModuleEvents.onAnalyseResult, {module: this, url: url, result: result});

    if (report?.performance) {
      const logs = Object.keys(report)
        .map((key) => `${key} : ${report[key]}`);
      this.config?.logger.success(`Lighthouse : ${logs.join(' | ')}`, url.toString());
    } else {
      this.config?.logger.error(`Could not analyse page`);
      this.config?.logger.error(report);

    }

    report.url = url.toString();
    this.config?.storage?.add('lighthouse', this.context, report);

    Event.emit(LighthouseModuleEvents.afterAnalyse, {module: this, url: url});
    Event.emit(ModuleEvents.afterAnalyse, {module: this, url: url});

    return true;
  }

  /**
   * Finish analyse process.
   *
   * @returns {Promise<any>}
   */
  async finish(): Promise<any> {
    const browser = await this.getBrowser();
    await browser?.kill();
    Event.emit(LighthouseModuleEvents.onBrowserClose, {module: this, browser: this.browser});
  }

  /**
   * Return browser.
   *
   * @returns {Promise<any>}
   */
  private async getBrowser(): Promise<any> {
    if (this.browser) {
      return new Promise((resolve) => resolve(this.browser));
    }

    // Launch browser.
    this.config?.logger.message('First, launch browser');

    this.browser = await ChromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });

    Event.emit(LighthouseModuleEvents.onBrowserLaunch, {module: this, browser: this.browser});

    return this.browser;
  }

}
