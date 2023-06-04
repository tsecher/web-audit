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
exports.W3CModule = exports.W3cValidatorModuleEvents = void 0;
const AbstractPuppeteerJourneyModule_1 = require("../../journey/AbstractPuppeteerJourneyModule");
const AbstractPuppeteerJourney_1 = require("../../journey/AbstractPuppeteerJourney");
const WebAuditEvent_1 = require("../../core/WebAuditEvent");
const ModuleInterface_1 = require("../ModuleInterface");
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
class W3CModule extends AbstractPuppeteerJourneyModule_1.AbstractPuppeteerJourneyModule {
    constructor() {
        super(...arguments);
        this.defaultOptions = {
            allowedTypes: ['error', 'warning'],
        };
    }
    get name() {
        return 'W3C';
    }
    get id() {
        return `w3c`;
    }
    /**
     * {@inheritdoc}
     */
    init(config, context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.config = config;
            this.context = context;
            // Install w3c store.
            (_a = this.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('w3c_validator', this.context, {
                url: 'Url',
                type: 'Type',
                message: 'Message',
                extract: 'Extract',
            });
            // Emit.
            WebAuditEvent_1.WebAuditEvent.emit(exports.W3cValidatorModuleEvents.createW3cValidatorModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            WebAuditEvent_1.WebAuditEvent.emit(exports.W3cValidatorModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            let success = false;
            const options = this.getOptions();
            if (this.dom) {
                try {
                    const result = yield validator({
                        url: urlWrapper.url.toString(),
                        data: this.dom,
                    });
                    WebAuditEvent_1.WebAuditEvent.emit(exports.W3cValidatorModuleEvents.onResult, { module: this, url: urlWrapper, result: result });
                    WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: result });
                    options.allowedTypes.forEach((type) => {
                        var _a;
                        const count = result.messages.filter((item) => item.type === type);
                        if (count.length) {
                            (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.warning(`[W3C] ${count.length} ${type} found.`);
                        }
                    });
                    console.log(result.messages);
                    result.messages
                        .filter((item) => options.allowedTypes.includes(item.type))
                        .forEach((item) => {
                        var _a, _b, _c;
                        item.url = urlWrapper.url.toString();
                        (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.add('w3c_validator', this.context, item);
                        (_c = this.config) === null || _c === void 0 ? void 0 : _c.logger.result(`W3C`, item, urlWrapper.url.toString());
                    });
                    success = true;
                }
                catch (error) {
                    success = false;
                }
            }
            else {
                success = false;
            }
            return success;
        });
    }
    /**
     * Finish analyse process.
     *
     * @returns {Promise<any>}
     */
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dom = null;
        });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, (data) => __awaiter(this, void 0, void 0, function* () {
            this.dom = null;
        }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_END, (data) => __awaiter(this, void 0, void 0, function* () {
            const wrapper = data.wrapper;
            this.dom = yield wrapper.page.evaluate(() => { var _a; return (_a = document === null || document === void 0 ? void 0 : document.querySelector('html')) === null || _a === void 0 ? void 0 : _a.outerHTML; });
            console.log('eriiieirt');
        }));
    }
}
exports.W3CModule = W3CModule;
