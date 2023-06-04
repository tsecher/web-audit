"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractPuppeteerJourneyModule = void 0;
class AbstractPuppeteerJourneyModule {
    getOptions(inputOptions = {}) {
        return Object.assign(Object.assign({}, this.defaultOptions), inputOptions);
    }
    analyse(url) {
        return Promise.resolve(true);
    }
    finish() {
    }
    initJourney(journey) {
        this.initEvents(journey);
        return this;
    }
}
exports.AbstractPuppeteerJourneyModule = AbstractPuppeteerJourneyModule;
