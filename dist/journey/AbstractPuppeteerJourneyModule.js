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
exports.AbstractPuppeteerJourneyModule = void 0;
const AbstractPuppeteerJourney_1 = require("./AbstractPuppeteerJourney");
class AbstractPuppeteerJourneyModule {
    constructor() {
        this.journeyContexts = [];
        this.journeySteps = [];
    }
    /**
     * {@inheritdoc}
     */
    getOptions(inputOptions = {}) {
        return Object.assign(Object.assign({}, this.defaultOptions), inputOptions);
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
        if (journey instanceof AbstractPuppeteerJourney_1.AbstractPuppeteerJourney) {
            journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, (data) => __awaiter(this, void 0, void 0, function* () {
                this.journeyContexts = [];
                this.journeySteps = [];
            }));
            journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, (data) => __awaiter(this, void 0, void 0, function* () { return this.journeyContexts.push(data); }));
            journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_BEFORE_STEP, (data) => __awaiter(this, void 0, void 0, function* () { return this.journeySteps.push(data); }));
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
exports.AbstractPuppeteerJourneyModule = AbstractPuppeteerJourneyModule;
