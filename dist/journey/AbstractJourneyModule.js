"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractJourneyModule = void 0;
class AbstractJourneyModule {
    analyse(url) {
    }
    finish() {
    }
    setJourney(journey) {
        this.journey = journey;
        return this;
    }
}
exports.AbstractJourneyModule = AbstractJourneyModule;
