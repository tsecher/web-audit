import {WebAuditContextClass} from '##/core/WebAuditContext';
import {UrlWrapper} from '##/core/UrlWrapper';
import {PageWrapper} from '##/journey/PageWrapper';
import {AbstractEventsClass} from '##/journey/AbstractEventsClass';
import {JourneyInterface} from '##/journey/JourneyInterface';

/**
 * Journey events.
 *
 * @type {{JOURNEY_START: string, JOURNEY_END: string}}
 */
export const PuppeteerJourneyEvents = {
  JOURNEY_START: 'Journey start',
  JOURNEY_END: 'Journey end',
  JOURNEY_NEW_CONTEXT: 'Journey new context',
  JOURNEY_ERROR: 'Journey error',
  JOURNEY_CLOSE: 'Journey close',
  JOURNEY_BEFORE_STEP: 'Before step',
  JOURNEY_AFTER_STEP: 'After step',
};

/**
 * Base class defining puppeteer journey.
 */
export abstract class AbstractPuppeteerJourney extends AbstractEventsClass implements JourneyInterface {

  abstract get name(): string;

  abstract get id(): string;

  private stopJourney: boolean | string = false;

  private step = 0;

  private eventData: any;

  private _context: WebAuditContextClass | undefined;

  /**
   * Constructor.
   */
  constructor() {
    super();

    this.stopJourney = false;
  }

  set context(context: WebAuditContextClass | undefined) {
    this._context = context;
  }

  get context(): WebAuditContextClass | undefined {
    return this._context;
  }

  /**
   * User journey description.
   *
   * @param wrapper
   * @param url
   * @returns {Promise<void>}
   */
  abstract journey(wrapper: PageWrapper, url: UrlWrapper): Promise<void>;

  /**
   * Play the user journey.
   *
   * @returns {Promise<void>}
   */
  async play(wrapper: PageWrapper, url: UrlWrapper) {
    this.stopJourney = false;
    this.eventData = {wrapper: wrapper, url: url, journey: this};

    // Play specifics.
    try {
      await this.trigger(PuppeteerJourneyEvents.JOURNEY_START, this.eventData);
      await this.journey(wrapper, url);
      if (this.stopJourney) {
        await this.trigger(PuppeteerJourneyEvents.JOURNEY_ERROR, this.eventData);
      } else {
        await this.trigger(PuppeteerJourneyEvents.JOURNEY_END, this.eventData);
      }
    } catch (err) {
      this.context?.config.logger.error(err);
      await this.trigger(PuppeteerJourneyEvents.JOURNEY_ERROR, this.eventData);
    }

    try {
      await this.trigger(PuppeteerJourneyEvents.JOURNEY_CLOSE, this.eventData);
    } catch (err) {
      this.context?.config.logger.error(err);
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
    const eventData: any = {
      ...this.eventData,
      ...{
        step: this.step,
        name: name,
      },
    };
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
          console.error(err);
          this.stop(err.message);
          resolve(null);
        });
    });
  }

  /**
   * Trigger new context.
   *
   * @param {string} name
   * @returns {Promise<void>}
   */
  async triggerNewContext(name: string) {
    this._checkStep();
    const eventData: any = {
      ...this.eventData,
      ...{
        step: this.step,
        name: name,
      },
    };
    await this.trigger(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, eventData);
  }

  /**
   * Check if journey can still run.
   *
   * @private
   */
  _checkStep() {
    if (this.stopJourney) {
      throw new Error(`Unexpected stop user journey  ${this.stopJourney}`);
    }
  }

  /**
   * Stop journey.
   */
  stop(message: string) {
    this.stopJourney = message;
  }

  /**
   * {@inheritdoc}
   */
  beforeAll(wrapper: PageWrapper): Promise<void> {
    return Promise.resolve();
  }

  /**
   * {@inheritdoc}
   */
  beforeEach(wrapper: PageWrapper, urlWrapper: UrlWrapper): Promise<void> {
    return Promise.resolve();
  }

  /**
   * {@inheritdoc}
   */
  isEligible(wrapper: PageWrapper, urlWrapper: UrlWrapper): Promise<boolean> {
    return Promise.resolve(true);
  }

}
