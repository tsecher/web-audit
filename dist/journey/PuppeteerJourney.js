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
const PageWrapper_1 = require("./PageWrapper");
/**
 * Journey events.
 *
 * @type {{JOURNEY_START: string, JOURNEY_END: string}}
 */
exports.PuppeteerJourneyEvents = {
    JOURNEY_START: 'Journey start',
    JOURNEY_END: 'Journey end',
};
/**
 * Base class defining puppeteer journey.
 */
class AbstractPuppeteerJourney {
    /**
     * Constructor.
     */
    constructor(logger) {
        this.stopJourney = false;
        this.logger = logger;
        this.stopJourney = false;
    }
    /**
     * Play the user journey.
     *
     * @returns {Promise<void>}
     */
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            // Init environment.
            const wrapper = new PageWrapper_1.PageWrapper();
            // Play specifics.
            try {
                yield this.init(wrapper);
                yield this.journey(wrapper);
            }
            catch (err) {
                this.logger.error(err);
            }
            try {
                yield wrapper.close();
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
    addStep(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkStep();
            return new Promise((resolve) => {
                cb()
                    .then((data) => resolve(data))
                    .catch(() => this.stop());
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
exports.AbstractPuppeteerJourney = AbstractPuppeteerJourney;
