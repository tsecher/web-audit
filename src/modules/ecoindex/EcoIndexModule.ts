import puppeteer from 'puppeteer';

import {ModuleInterface} from '../ModuleInterface';
import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';

export class EcoIndexModule implements ModuleInterface {

  get name(): string {
    return 'Eco Index';
  }

  private options: any;

  private browser: any;

  private config?: Config;

  private context?: Context;

  private defaultOptions = {
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    viewport: {
      width: 1920,
      height: 1080,
      isMobile: false,
    },
    timeout: 180000,
  };

  constructor(
    userOptions: any,
  ) {
    this.options = {
      ...this.defaultOptions,
      ...userOptions,
    };
  }

  /**
   * {@inheritdoc}
   */
  init(config: Config, context: Context): void {
    this.config = config;
    this.context = context;
  }

  /**
   * {@inheritdoc}
   */
  async analyse(url: URL): Promise<any> {

    const browser = await this.getBrowser();

    const page = this.getPage(browser, url);
  }

  /**
   * Return browser.
   *
   * @returns {Promise<any>}
   */
  async getBrowser(): Promise<any> {
    if (this.browser) {
      return new Promise((resolve) => resolve(this.browser));
    }

    return puppeteer.launch({
      headless: true,
      args: this.options.browserArgs,
      pipe: true,
      ignoreDefaultArgs: [
        '--disable-gpu',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ],
    });
  }

  private async getPage(browser: any, url: URL) {
    this.config?.logger.message('0');

    const page = await browser.newPage();
    this.config?.logger.message('1');

    await page.setViewport(this.options.viewport);
    this.config?.logger.message('2');

    await page.setCacheEnabled(false);
    this.config?.logger.message('3');

    try {
      this.config?.logger.message('Try');
      await page.goto(url.toString(), {timeout: this.options.timeout});
    } finally {
      this.config?.logger.message('ok');
    }
  }

}
