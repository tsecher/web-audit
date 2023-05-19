import puppeteer from 'puppeteer';
import {scrollPageToBottom} from 'puppeteer-autoscroll-down';

import {ModuleEvents, ModuleInterface} from '../ModuleInterface';
import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';
import {UrlWrapper} from '../../core/UrlWrapper';

const os = require('os-utils');

export const CPUModuleEvents: any = {
  createCPUModule: 'cpu__createCPUModule',
  beforeAnalyse: 'cpu__beforeAnalyse',
  onResult: 'cpu__onResult',
  onBrowserClose: 'cpu__onBrowserClose',
  onBrowserLaunch: 'cpu__onBrowserLaunch',
  onNewPage: 'cpu__onNewPage',
  afterAnalyse: 'cpu__afterAnalyse',
};

export class CPUModule implements ModuleInterface {

  get name(): string {
    return 'CPU';
  }

  get id(): string {
    return `cpu`;
  }

  private options: any;

  private browser: any;

  private config?: Config;

  private context?: Context;

  private interval?: any;

  private stock: any = [];

  private noiseAverage: any;
  private currentStep = 0;

  private defaultOptions = {
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--single-process',
    ],
    viewport: {
      width: 1920,
      height: 1080,
      isMobile: false,
    },
    timeout: 180000,
    pause: 2000,
  };

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

    // Install eco index store.
    this.config.storage?.installStore('cpu', this.context, {
      url: 'Url',
      time: 'Time',
      cpu: 'CPU use average (%)',
      noiselessCPU: 'Noiseless CPU use average (%)',
    });

    // Install eco index best_practices.
    this.config.storage?.installStore('cpu_history', this.context, {
      url: 'Url',
      time: 'Time',
      step: 'Step',
      cpu: 'CPU usage (%)',
      noiselessCPU: 'Noiseless CPU usage (%)',
    });

    // Emit.
    Event.emit(CPUModuleEvents.createCPUModule, {module: this});
  }

  /**
   * {@inheritdoc}
   */
  async analyse(urlWrapper: UrlWrapper): Promise<any> {
    Event.emit(CPUModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});
    Event.emit(ModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});

    const browser = await this.getBrowser();

    const result: any = await this.getAnalysisResult(browser, urlWrapper);
    Event.emit(CPUModuleEvents.onResult, {module: this, url: urlWrapper, browser: this.browser, result: result});
    Event.emit(CPUModuleEvents.afterAnalyse, {module: this, url: urlWrapper, result: result});
    Event.emit(ModuleEvents.afterAnalyse, {module: this, url: urlWrapper});

    return result?.success || false;
  }

  /**
   * Finish analyse process.
   *
   * @returns {Promise<any>}
   */
  async finish(): Promise<any> {
    const browser = await this.getBrowser();
    await browser?.close();
    Event.emit(CPUModuleEvents.onBrowserClose, {module: this, browser: this.browser});
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
    this.browser = await puppeteer.launch({
      headless: true,
      args: this.options.browserArgs,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: [
        '--disable-gpu',
      ],
    });

    Event.emit(CPUModuleEvents.onBrowserLaunch, {module: this, browser: this.browser});

    return this.browser;
  }

  /**
   * Get page.
   *
   * @param browser
   * @param {URL} urlWrapper
   * @returns {Promise<void>}
   * @private
   */
  private async getAnalysisResult(browser: any, urlWrapper: UrlWrapper) {
    // Init page configuration.
    const page = await browser.newPage();
    await page.setViewport(this.options.viewport);
    await page.setCacheEnabled(false);

    // Define current delta usage to get only page CPU usage.
    this.noiseAverage = 0;
    this.startTimer();
    await this.wait(2000);
    this.stopTimer();
    this.noiseAverage = this.getAverageData().cpu;

    this.stock = [];
    this.currentStep = 0;
    this.startTimer();
    this.currentStep++;
    await this.wait(this.options.pause);
    this.currentStep++;
    await page.goto(urlWrapper.url);
    this.currentStep++;
    await this.wait(this.options.pause);
    this.currentStep++;
    await this.scrollToBottom(page);
    this.currentStep++;
    await this.wait(this.options.pause);
    this.stopTimer();

    return this.getResult(urlWrapper);
  }

  /**
   * Scroll to bottom of the page.
   *
   * @param page
   * @returns {Promise<void>}
   */
  private async scrollToBottom(page: any) {
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const windowHeight = await page.evaluate(() => window.innerHeight);
    for (let i = 0; i < Math.floor(bodyHeight / windowHeight) + 2; i++) {
      await scrollPageToBottom(page, {
        size: windowHeight,
        delay: 200,
      });
    }
  }

  /**
   * Wait timeout.
   *
   * @param timeout
   * @returns {Promise<unknown>}
   */
  private async wait(timeout = 1000) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(null), timeout);
    });
  }

  /**
   * Init timer
   */
  private startTimer() {
    const firstTime = new Date().getTime();

    this.interval = setInterval(() => {
      const usage: any = {
        time: (new Date().getTime() - firstTime) / 1000,
        step: this.currentStep,
      };

      os.cpuUsage((value: any) => {
        const cpu = value * 100;
        usage.cpu = cpu;
        usage.noiselessCPU = cpu - this.noiseAverage;
      });

      this.stock.push(usage);
    }, 100);
  }

  /**
   * Stop timer.
   */
  private stopTimer() {
    clearInterval(this.interval);
  }

  /**
   * Return the result.
   *
   * @param {UrlWrapper} urlWrapper
   * @returns {any}
   * @private
   */
  private getResult(urlWrapper: UrlWrapper): any {
    this.stock.forEach((item: any) => {

      this.config?.storage?.add('cpu_history', this.context, {
        ...item,
        ...{
          url: urlWrapper.url,
        },
      });
    });

    // Average.
    const averageData = {
      ...this.getAverageData(),
      ...{
        url: urlWrapper.url,
      },
    };
    this.config?.storage?.add('cpu', this.context, averageData);
    return averageData;
  }

  /**
   * Return average data.
   *
   * @returns {{noiselessCPU: number, cpu: number, time: any}}
   * @private
   */
  private getAverageData() {
    return {
      time: this.stock.at(-1).time,
      cpu: this.stock.reduce((sum: number, currentValue: any) => sum + (currentValue.cpu || 0), 0) / this.stock.length,
      noiselessCPU: this.stock.reduce((sum: number, currentValue: any) => sum + (currentValue.noiselessCPU || 0), 0) / this.stock.length,
    };
  }

}
