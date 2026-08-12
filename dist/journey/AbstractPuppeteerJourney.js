import { AbstractEventsClass } from '##/journey/AbstractEventsClass';
/**
 * Journey events.
 *
 * @type {{JOURNEY_START: string, JOURNEY_END: string}}
 */
export const PuppeteerJourneyEvents = {
    JOURNEY_START: 'Journey start',
    JOURNEY_END: 'Journey end',
    JOURNEY_NEW_CONTEXT: 'Journey new context',
    JOURNEY_END_CONTEXT: 'Journey end context',
    JOURNEY_ERROR: 'Journey error',
    JOURNEY_CLOSE: 'Journey close',
    JOURNEY_BEFORE_STEP: 'Before step',
    JOURNEY_AFTER_STEP: 'After step',
};
/**
 * Base class defining puppeteer journey.
 */
export class AbstractPuppeteerJourney extends AbstractEventsClass {
    stopJourney = false;
    step = 0;
    eventData;
    _context;
    currentContextName;
    /**
     * Constructor.
     */
    constructor() {
        super();
        this.stopJourney = false;
    }
    set context(context) {
        this._context = context;
    }
    get context() {
        return this._context;
    }
    /**
     * Play the user journey.
     *
     * @returns {Promise<void>}
     */
    async play(wrapper, url) {
        this.stopJourney = false;
        this.eventData = { wrapper: wrapper, url: url, journey: this };
        // Play specifics.
        try {
            await this.trigger(PuppeteerJourneyEvents.JOURNEY_START, this.eventData);
            await this.journey(wrapper, url);
            if (this.stopJourney) {
                await this.trigger(PuppeteerJourneyEvents.JOURNEY_ERROR, this.eventData);
            }
            else {
                await this.trigger(PuppeteerJourneyEvents.JOURNEY_END, this.eventData);
            }
        }
        catch (err) {
            this.context?.config.logger.error(err);
            await this.trigger(PuppeteerJourneyEvents.JOURNEY_ERROR, this.eventData);
        }
        try {
            await this.trigger(PuppeteerJourneyEvents.JOURNEY_CLOSE, this.eventData);
        }
        catch (err) {
            this.context?.config.logger.error(err);
        }
    }
    /**
     * Wrap action in simple promise.
     *
     * @param cb
     * @returns {Promise<unknown>}
     */
    async addStep(name, cb) {
        this._checkStep();
        const eventData = {
            ...this.eventData,
            ...{
                step: this.step,
                name: name,
            },
        };
        await this.trigger(PuppeteerJourneyEvents.JOURNEY_BEFORE_STEP, eventData);
        return new Promise((resolve) => {
            cb()
                .then(async (data) => {
                this.step++;
                await this.trigger(PuppeteerJourneyEvents.JOURNEY_AFTER_STEP, eventData);
                resolve(data);
            })
                .catch(async (err) => {
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
    async triggerNewContext(name) {
        this._checkStep();
        const eventData = {
            ...this.eventData,
            ...{
                step: this.step,
                name: name,
            },
        };
        this.currentContextName = name;
        await this.trigger(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, eventData);
    }
    async triggerEndContext() {
        if (this.currentContextName) {
            const eventData = {
                ...this.eventData,
                ...{
                    step: this.step,
                    name: this.currentContextName,
                },
            };
            await this.trigger(PuppeteerJourneyEvents.JOURNEY_END_CONTEXT, eventData);
        }
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
    stop(message) {
        this.stopJourney = message;
    }
    /**
     * {@inheritdoc}
     */
    beforeAll(wrapper) {
        return Promise.resolve();
    }
    /**
     * {@inheritdoc}
     */
    beforeEach(wrapper, urlWrapper) {
        return Promise.resolve();
    }
    /**
     * {@inheritdoc}
     */
    isEligible(wrapper, urlWrapper) {
        return Promise.resolve(true);
    }
}
