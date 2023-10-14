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
exports.W3cValidatorModule = exports.W3cValidatorModuleEvents = void 0;
const AbstractPuppeteerJourneyModule_1 = require("../../journey/AbstractPuppeteerJourneyModule");
const AbstractPuppeteerJourney_1 = require("../../journey/AbstractPuppeteerJourney");
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
class W3cValidatorModule extends AbstractPuppeteerJourneyModule_1.AbstractPuppeteerJourneyModule {
    constructor() {
        super(...arguments);
        this.defaultOptions = {
            allowedTypes: ['error', 'warning'],
        };
        this.doms = [];
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
    init(context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.context = context;
            // Install w3c store.
            (_a = this.context.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('w3c', this.context, {
                url: 'Url',
                context: 'Context',
                error: 'Errors',
                warning: 'Warnings',
                info: 'Infos',
            });
            (_b = this.context.config.storage) === null || _b === void 0 ? void 0 : _b.installStore('w3c_details', this.context, {
                url: 'Url',
                context: 'Context',
                type: 'Type',
                message: 'Message',
                extract: 'Extract',
            });
            // Emit.
            this.context.eventBus.emit(exports.W3cValidatorModuleEvents.createW3cValidatorModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.context) === null || _a === void 0 ? void 0 : _a.eventBus.emit(exports.W3cValidatorModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.emit(ModuleInterface_1.ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            let success = false;
            const options = this.getOptions();
            this.doms = this.doms || [];
            for (const index in this.doms) {
                const dom = this.doms[index];
                if (dom) {
                    try {
                        (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(ModuleInterface_1.ModuleEvents.startsComputing, { module: this });
                        const result = yield validator({
                            url: urlWrapper.url.toString(),
                            data: dom,
                        });
                        (_d = this.context) === null || _d === void 0 ? void 0 : _d.eventBus.emit(exports.W3cValidatorModuleEvents.onResult, {
                            module: this,
                            url: urlWrapper,
                            result: result
                        });
                        (_e = this.context) === null || _e === void 0 ? void 0 : _e.eventBus.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: result });
                        const summary = { context: this.journeyContexts[index].name };
                        options.allowedTypes.forEach((type) => {
                            summary[type] = result.messages.filter((item) => item.type === type).length;
                        });
                        (_g = (_f = this.context) === null || _f === void 0 ? void 0 : _f.config) === null || _g === void 0 ? void 0 : _g.logger.result(`W3C`, summary, urlWrapper.url.toString());
                        summary.url = urlWrapper.url.toString();
                        (_k = (_j = (_h = this.context) === null || _h === void 0 ? void 0 : _h.config) === null || _j === void 0 ? void 0 : _j.storage) === null || _k === void 0 ? void 0 : _k.add('w3c', this.context, summary);
                        result.messages
                            .filter((item) => options.allowedTypes.includes(item.type))
                            .forEach((item) => {
                            var _a, _b, _c;
                            item.url = urlWrapper.url.toString();
                            item.context = this.journeyContexts[index].name;
                            (_c = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.storage) === null || _c === void 0 ? void 0 : _c.add('w3c_details', this.context, item);
                        });
                        (_l = this.context) === null || _l === void 0 ? void 0 : _l.eventBus.emit(ModuleInterface_1.ModuleEvents.endsComputing, { module: this });
                        success = true;
                    }
                    catch (error) {
                        success = false;
                    }
                }
            }
            return success;
        });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, () => __awaiter(this, void 0, void 0, function* () {
            this.doms = [];
        }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, (data) => __awaiter(this, void 0, void 0, function* () {
            const wrapper = data.wrapper;
            this.doms = this.doms || [];
            this.doms.push(yield wrapper.page.content());
        }));
    }
}
exports.W3cValidatorModule = W3cValidatorModule;
