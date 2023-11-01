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
exports.GreenWebFoundationModule = exports.GreenWebFoundationModuleEvents = void 0;
const AbstractDomainModule_1 = require("../../domain/AbstractDomainModule");
const ModuleInterface_1 = require("../ModuleInterface");
/**
 * Mozilla Observatory Module events.
 */
exports.GreenWebFoundationModuleEvents = {
    createGreenWebFoundationModule: 'mozilla_observatory_module__createGreenWebFoundationModule',
    onResult: 'mozilla_observatory_module__onResult',
};
/**
 * Mozilla Observatory Validator.
 */
class GreenWebFoundationModule extends AbstractDomainModule_1.AbstractDomainModule {
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'GreenWebFoundation';
    }
    /**
     * {@inheritdoc}
     */
    get id() {
        return `green_web_foundation`;
    }
    /**
     * {@inheritdoc}
     */
    init(context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.context = context;
            // Install store.
            (_a = this.context.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('green_web_foundation', this.context, {
                url: 'URL',
                hosted_by: 'Hosted by',
                hosted_by_website: 'Hosted by website',
                partner: 'Partner',
                green: 'Green',
                hosted_by_id: 'Hosted by ID', // eslint-disable-line @typescript-eslint/naming-convention
            });
            // Emit.
            this.context.eventBus.emit(exports.GreenWebFoundationModuleEvents.createGreenWebFoundationModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (_a = this.context) === null || _a === void 0 ? void 0 : _a.eventBus.emit(ModuleInterface_1.ModuleEvents.startsComputing, { module: this });
                const endpoint = `https://api.thegreenwebfoundation.org/api/v3/greencheck/${urlWrapper.url.hostname}`;
                const response = yield fetch(endpoint, { method: 'GET' });
                const result = yield response.json();
                result.url = urlWrapper.url.hostname;
                const summary = {
                    url: urlWrapper.url.hostname,
                    hosted_by: result.hosted_by,
                    hosted_by_website: result.hosted_by_website,
                    partner: result.partner,
                    green: result.green,
                };
                (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.emit(exports.GreenWebFoundationModuleEvents.onResult, {
                    module: this,
                    url: urlWrapper,
                    result: result,
                });
                (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: result });
                (_e = (_d = this.context) === null || _d === void 0 ? void 0 : _d.config) === null || _e === void 0 ? void 0 : _e.logger.result(`Green Web Foundation`, summary, urlWrapper.url.toString());
                // @ts-ignore
                (_h = (_g = (_f = this.context) === null || _f === void 0 ? void 0 : _f.config) === null || _g === void 0 ? void 0 : _g.storage) === null || _h === void 0 ? void 0 : _h.one('green_web_foundation', this.context, result);
                (_j = this.context) === null || _j === void 0 ? void 0 : _j.eventBus.emit(ModuleInterface_1.ModuleEvents.endsComputing, { module: this });
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    /**
     * {@inheritdoc}
     */
    finish() {
    }
}
exports.GreenWebFoundationModule = GreenWebFoundationModule;
