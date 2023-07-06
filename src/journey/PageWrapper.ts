import fs from 'fs';

import puppeteer from 'puppeteer';
import {scrollPageToBottom} from 'puppeteer-autoscroll-down';

import {WebAuditConfig as Config} from '../core/WebAuditConfig';
import {WebAuditContext as Context} from '../core/WebAuditContext';

/**
 * Default Options for page wrapper.
 *
 * @type {{browserArgs: string[], viewport: {width: number, isMobile: boolean, height: number}, timeout: number}}
 */
export const DEFAULT_OPTIONS = {
  browserArgs: [
    '--no-sandbox',
  ],
  viewport: {
    width: 1920, height: 1080, isMobile: false,
  },
  timeout: 180000,
};

/**
 * Puppeteer page wrapper provides page tools for journey.
 */
export class PageWrapper {

  /**
   * Current options.
   *
   * @type {{}}
   */
  public options: any = {};

  /**
   * The browser.
   *
   * @type {any}
   * @private
   */
  private browser: any;

  /**
   * The page.
   *
   * @type {any}
   * @private
   */
  private _page: any;

  private step = 0;

  /**
   * Constructor
   *
   * @param name
   */
  constructor(options = {}) {
    // Build dependencies.
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * Get browser and init it if not set yet.
   * @returns {Promise<Browser>}
   */
  async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: this.options.browserArgs,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--disable-gpu'],
      });
    }

    return Promise.resolve(this.browser);
  }

  /**
   * Close browser session.
   *
   * @returns {Promise<PageWrapper>}
   */
  async close(): Promise<PageWrapper> {
    if (this.browser) {
      await this.browser.close();
      return this;
    }
    return Promise.resolve(this);
  }

  /**
   * Create new page context.
   *
   * @param context
   * @returns {Promise<PageWrapper>}
   */
  async newPage(): Promise<PageWrapper> {
    const browser = await this.getBrowser();

    this._page = await browser.newPage();
    await this._page.setViewport(this.options.viewport);

    return this;
  }

  /**
   * Go To url.
   *
   * @param url
   * @returns {Promise<PageWrapper>}
   */
  async goto(url: string) {
    await this._page.goto(url);
    return this;
  }

  /**
   * Snap a session (image and html file).
   *
   * @param name
   * @returns {Promise<PageWrapper>}
   */
  async snap(name: string, screenPath = 'screenshots') {
    if (this._page) {
      this.step++;
      const steppedName = `${this.step}${name ? ` - ${name}` : ``}`;

      fs.mkdirSync(screenPath, {recursive: true});

      // Create file.
      const body = await this.page.evaluate(() => document?.querySelector('html')?.outerHTML);
      fs.writeFileSync(`${screenPath}/${steppedName}.html`, body, 'utf8');
      Config.storage?.file(`${screenPath}/${steppedName}.html`, Context.current);

      // Snapshot.
      await this.page.screenshot({path: `${screenPath}/${steppedName}.png`});
      Config.storage?.file(`${screenPath}/${steppedName}.png`, Context.current);
    }
    return Promise.resolve(this);
  }

  /**
   * Wait timeout.
   *
   * @param timeout
   * @returns {Promise<unknown>}
   */
  async wait(timeout = 1000) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this), timeout);
    });
  }

  /**
   * Scroll to bottom of the page.
   *
   * @param page
   * @returns {Promise<void>}
   */
  async scrollToBottom() {
    const bodyHeight = await this._page.evaluate(() => document.body.clientHeight);
    const windowHeight = await this._page.evaluate(() => window.innerHeight);
    for (let i = 0; i < Math.floor(bodyHeight / windowHeight) + 2; i++) {
      await scrollPageToBottom(this._page, {
        size: windowHeight,
        delay: 200,
      });
    }
  }

  get page(): any {
    return this._page;
  }
}
