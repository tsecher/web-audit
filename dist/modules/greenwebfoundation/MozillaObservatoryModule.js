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
exports.MozillaObservatoryModule = exports.MozillaObservatoryModuleEvents = void 0;
const AbstractDomainModule_1 = require("../../domain/AbstractDomainModule");
const ModuleInterface_1 = require("../ModuleInterface");
/**
 * Mozilla Observatory Module events.
 */
exports.MozillaObservatoryModuleEvents = {
    createMozillaObservatoryModule: 'mozilla_observatory_module__createMozillaObservatoryModule',
    onResult: 'mozilla_observatory_module__onResult',
};
/**
 * Mozilla Observatory Validator.
 */
class MozillaObservatoryModule extends AbstractDomainModule_1.AbstractDomainModule {
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'MozillaObservatory';
    }
    /**
     * {@inheritdoc}
     */
    get id() {
        return `mozilla_observatory`;
    }
    /**
     * {@inheritdoc}
     */
    init(context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.context = context;
            // Install store.
            (_a = this.context.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('mozilla_observatory', this.context, {
                url: 'URL',
                grade: 'Grade',
                likelihood_indicator: 'Likelihood Indicator',
                score: 'Score',
                scan_id: 'Scan ID',
                status_code: 'Status code',
                tests_failed: 'Tests failed',
                tests_passed: 'Test passed',
                tests_quantity: 'Test quantity', // eslint-disable-line @typescript-eslint/naming-convention
            });
            // Emit.
            this.context.eventBus.emit(exports.MozillaObservatoryModuleEvents.createMozillaObservatoryModule, { module: this });
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
                const endpoint = `https://http-observatory.security.mozilla.org/api/v1/analyze?host=${urlWrapper.url.hostname}`;
                const data = {
                    hidden: true,
                };
                const customHeaders = {
                    'Content-Type': 'application/json', // eslint-disable-line @typescript-eslint/naming-convention
                };
                const response = yield fetch(endpoint, {
                    method: 'POST',
                    headers: customHeaders,
                    body: JSON.stringify(data),
                });
                const result = yield response.json();
                result.url = urlWrapper.url.hostname;
                const summary = {
                    url: urlWrapper.url.hostname,
                    grade: result.grade,
                    score: result.score,
                    tests_failed: result.tests_failed,
                    tests_passed: result.tests_passed, // eslint-disable-line @typescript-eslint/naming-convention
                };
                (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.emit(exports.MozillaObservatoryModuleEvents.onResult, { module: this, url: urlWrapper, result: result });
                (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: result });
                (_e = (_d = this.context) === null || _d === void 0 ? void 0 : _d.config) === null || _e === void 0 ? void 0 : _e.logger.result(`Mozilla Observatory`, summary, urlWrapper.url.toString());
                (_h = (_g = (_f = this.context) === null || _f === void 0 ? void 0 : _f.config) === null || _g === void 0 ? void 0 : _g.storage) === null || _h === void 0 ? void 0 : _h.one('mozilla_observatory', this.context, result);
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
exports.MozillaObservatoryModule = MozillaObservatoryModule;
