"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractPuppeteerJourneyModule = void 0;
class AbstractPuppeteerJourneyModule {
    analyse(url) {
    }
    finish() {
    }
    initJourney(journey) {
        this.initEvents(journey);
        return this;
    }
}
exports.AbstractPuppeteerJourneyModule = AbstractPuppeteerJourneyModule;
