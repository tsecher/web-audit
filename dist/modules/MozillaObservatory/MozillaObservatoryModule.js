"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MozillaObservatoryModule = exports.W3cValidatorModuleEvents = void 0;
const AbstractPuppeteerJourneyModule_1 = require("../../journey/AbstractPuppeteerJourneyModule");
const validator = require('html-validator');
/**
 * W3c Validator Module events.
 */
exports.W3cValidatorModuleEvents = {
    createW3cValidatorModule: 'w3c_validator_module__createW3cValidatorModule',
    beforeAnalyse: 'w3c_validator_module__beforeAnalyse',
    onResult: 'w3c_validator_module__onResult',
    afterAnalyse: 'w3c_validator_module__afterAnalyse',
};
/**
 * W3c Validator.
 */
class MozillaObservatoryModule extends AbstractPuppeteerJourneyModule_1.AbstractPuppeteerJourneyModule {
    get name() {
        return 'MozillaObservatory';
    }
    get id() {
        return `mozilla_observatory`;
    }
}
exports.MozillaObservatoryModule = MozillaObservatoryModule;
