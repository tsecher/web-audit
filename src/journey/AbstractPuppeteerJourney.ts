import {LoggerInterface} from '../loggers/Logger';
import {UrlWrapper} from '../core/UrlWrapper';

import {PageWrapper} from './PageWrapper';
import {AbstractEventsClass} from './AbstractEventsClass';

/**
 * Journey events.
 *
 * @type {{JOURNEY_START: string, JOURNEY_END: string}}
 */
export const PuppeteerJourneyEvents = {
  JOURNEY_START: 'Journey start',
  JOURNEY_END: 'Journey end',
  JOURNEY_ERROR: 'Journey error',
  JOURNEY_CLOSE: 'Journey close',
  JOURNEY_BEFORE_STEP: 'Before step',
  JOURNEY_AFTER_STEP: 'After step',
};

/**
 * Base class defining puppeteer journey.
 */
export abstract class AbstractPuppeteerJourney extends AbstractEventsClass {

  private stopJourney = false;

  private logger: LoggerInterface;

  private step = 0;

  /**
   * Constructor.
   */
  constructor(logger: LoggerInterface) {
    super();

    this.logger = logger;
    this.stopJourney = false;
  }

  /**
   * Method for journey initialisation, called before journey start.
   *
   * @param wrapper
   * @param logger
   * @returns {Promise<void>}
   */
  abstract init(wrapper: PageWrapper): Promise<void>;

  /**
   * User journey description.
   *
   * @param wrapper
   * @param logger
   * @returns {Promise<void>}
   */
  abstract journey(wrapper: PageWrapper, url: UrlWrapper): Promise<void>;

  /**
   * Play the user journey.
   *
   * @returns {Promise<void>}
   */
  async play(wrapper: PageWrapper, url: UrlWrapper) {
    const eventData: any = {wrapper: wrapper, url: url, journey: this};

    // Play specifics.
    try {
      await this.init(wrapper);
      await this.trigger(PuppeteerJourneyEvents.JOURNEY_START, eventData);
      await this.journey(wrapper, url);
      await this.trigger(PuppeteerJourneyEvents.JOURNEY_END, eventData);
    } catch (err) {
      this.logger.error(err);
      await this.trigger(PuppeteerJourneyEvents.JOURNEY_ERROR, eventData);
    }

    try {
      await this.trigger(PuppeteerJourneyEvents.JOURNEY_CLOSE, eventData);
      await wrapper.close();
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * Wrap action in simple promise.
   *
   * @param cb
   * @returns {Promise<unknown>}
   */
  async addStep(name: string, cb: any) {
    this._checkStep();
    const eventData: any = {step: this.step, journey: this, name: name};
    await this.trigger(PuppeteerJourneyEvents.JOURNEY_BEFORE_STEP, eventData);
    return new Promise((resolve) => {
      cb()
        .then(async (data: any) => {
          this.step++;
          await this.trigger(PuppeteerJourneyEvents.JOURNEY_AFTER_STEP, eventData);
          resolve(data);
        })
        .catch(async (err: any) => {
          await this.trigger(PuppeteerJourneyEvents.JOURNEY_ERROR, eventData);
          console.log(err);
          this.stop();
        });
    });
  }

  /**
   * Check if journey can still run.
   *
   * @private
   */
  _checkStep() {
    if (this.stopJourney) {
      throw new Error(`Unexpected stop user journey`);
    }
  }

  /**
   * Stop journey.
   */
  stop() {
    this.stopJourney = true;
  }

}
