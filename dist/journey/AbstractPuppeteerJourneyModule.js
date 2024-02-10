import { MODULE_TYPES } from '##/modules/ModuleInterface';
import { AbstractPuppeteerJourney, PuppeteerJourneyEvents } from '##/journey/AbstractPuppeteerJourney';
export class AbstractPuppeteerJourneyModule {
    defaultOptions;
    context;
    journeyContexts = [];
    journeySteps = [];
    /**
     * {@inheritdoc}
     */
    get type() {
        return MODULE_TYPES.JOURNEY;
    }
    /**
     * {@inheritdoc}
     */
    getOptions(inputOptions = {}) {
        return {
            ...this.defaultOptions,
            ...inputOptions,
        };
    }
    /**
     * {@inheritdoc}
     */
    analyse(url) {
        return Promise.resolve(true);
    }
    /**
     * {@inheritdoc}
     */
    initJourney(journey) {
        this.initEvents(journey);
        if (journey instanceof AbstractPuppeteerJourney) {
            journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data) => {
                this.journeyContexts = [];
                this.journeySteps = [];
            });
            journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data) => this.journeyContexts.push(data));
            journey.on(PuppeteerJourneyEvents.JOURNEY_BEFORE_STEP, async (data) => this.journeySteps.push(data));
        }
        return this;
    }
    /**
     * {@inheritdoc}
     */
    finish() {
        this.journeyContexts = [];
        this.journeySteps = [];
    }
}
