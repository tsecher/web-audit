"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractPuppeteerJourney = exports.PuppeteerJourneyEvents = void 0;
const AbstractEventsClass_1 = require("./AbstractEventsClass");
/**
 * Journey events.
 *
 * @type {{JOURNEY_START: string, JOURNEY_END: string}}
 */
exports.PuppeteerJourneyEvents = {
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
class AbstractPuppeteerJourney extends AbstractEventsClass_1.AbstractEventsClass {
    /**
     * Constructor.
     */
    constructor(logger) {
        super();
        this.stopJourney = false;
        this.step = 0;
        this.logger = logger;
        this.stopJourney = false;
    }
    /**
     * Play the user journey.
     *
     * @returns {Promise<void>}
     */
    play(wrapper, url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.eventData = { wrapper: wrapper, url: url, journey: this };
            // Play specifics.
            try {
                yield this.init(wrapper);
                yield this.trigger(exports.PuppeteerJourneyEvents.JOURNEY_START, this.eventData);
                yield this.journey(wrapper, url);
                yield this.trigger(exports.PuppeteerJourneyEvents.JOURNEY_END, this.eventData);
            }
            catch (err) {
                this.logger.error(err);
                yield this.trigger(exports.PuppeteerJourneyEvents.JOURNEY_ERROR, this.eventData);
            }
            try {
                yield this.trigger(exports.PuppeteerJourneyEvents.JOURNEY_CLOSE, this.eventData);
            }
            catch (err) {
                this.logger.error(err);
            }
        });
    }
    /**
     * Wrap action in simple promise.
     *
     * @param cb
     * @returns {Promise<unknown>}
     */
    addStep(name, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkStep();
            const eventData = Object.assign(Object.assign({}, this.eventData), {
                step: this.step,
                name: name,
            });
            yield this.trigger(exports.PuppeteerJourneyEvents.JOURNEY_BEFORE_STEP, eventData);
            return new Promise((resolve) => {
                cb()
                    .then((data) => __awaiter(this, void 0, void 0, function* () {
                    this.step++;
                    yield this.trigger(exports.PuppeteerJourneyEvents.JOURNEY_AFTER_STEP, eventData);
                    resolve(data);
                }))
                    .catch((err) => __awaiter(this, void 0, void 0, function* () {
                    console.log(err);
                    process.exit();
                    yield this.trigger(exports.PuppeteerJourneyEvents.JOURNEY_ERROR, eventData);
                    this.stop();
                }));
            });
        });
    }
    /**
     * Trigger new context.
     *
     * @param {string} name
     * @returns {Promise<void>}
     */
    triggerNewContext(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventData = Object.assign(Object.assign({}, this.eventData), {
                step: this.step,
                name: name,
            });
            yield this.trigger(exports.PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, eventData);
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
exports.AbstractPuppeteerJourney = AbstractPuppeteerJourney;
