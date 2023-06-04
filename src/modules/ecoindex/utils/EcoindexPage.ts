/**
 * Ecoindex page wrapper.
 */
import {scrollPageToBottom} from 'puppeteer-autoscroll-down';

import {AbstractEventsClass} from '../../../journey/AbstractEventsClass';

import {ECOINDEX_HANDLER_OPTIONS, EcoindexDataHandler} from './EcoindexDataHandler';

/**
 * Events.
 *
 * @type {{AFTER_INIT: string, PAGE_LOADED: string, AFTER_SCROLL: string, AFTER_VISIT: string}}
 */
export const ECOINDEX_PAGE_EVENTS = {
  AFTER_INIT: 'After initialization',
  AFTER_VISIT: 'After visit url',
  PAGE_LOADED: 'Pages has been loaded',
  AFTER_SCROLL: 'After scroll',
};

/**
 * Get the ecoindex raw data for a specific page.
 */
export class EcoindexPage extends AbstractEventsClass {

  /** ======================================================
   ||                  Analyse
   ======================================================= */
  async analyseUrl(page: any, url: any, conf = {}) {
    const options = {...ECOINDEX_HANDLER_OPTIONS, ...conf};
    const handler = new EcoindexDataHandler(page, options);
    const eventData = {page: page, url: url, options: options, handler: handler};

    await handler.init();
    await this.trigger(ECOINDEX_PAGE_EVENTS.AFTER_INIT, eventData);

    // Load the page.
    await page.goto(url, {timeout: options.timeout});
    await this.trigger(ECOINDEX_PAGE_EVENTS.AFTER_VISIT, eventData);
    try {
      await page.waitForNavigation({waitUntil: 'domcontentloaded', timeout: options.timeout});
    } catch (err) {
      console.log(`Too long`);
    }
    await this.trigger(ECOINDEX_PAGE_EVENTS.PAGE_LOADED, eventData);

    // Scroll to bottom in order to load all imgs dependencies.
    await this.scrollToBottom(page);
    await this.trigger(ECOINDEX_PAGE_EVENTS.AFTER_SCROLL, eventData);

    // Get result.
    const result = handler.getRawResult();
    handler.stop();
    return result;
  }

  /**
   * Scroll to bottom of the page.
   *
   * @param page
   * @returns {Promise<void>}
   */
  async scrollToBottom(page: any) {
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const windowHeight = await page.evaluate(() => window.innerHeight);
    for (let i = 0; i < Math.floor(bodyHeight / windowHeight) + 2; i++) {
      await scrollPageToBottom(page, {
        size: windowHeight,
        delay: 200,
      });
    }
  }
}
