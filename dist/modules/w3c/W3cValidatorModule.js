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
const ModuleInterface_1 = require("../ModuleInterface");
const WebAuditEvent_1 = require("../../core/WebAuditEvent");
const validator = require('html-validator');
exports.W3cValidatorModuleEvents = {
    createW3cValidatorModule: 'w3c_validator_module__createW3cValidatorModule',
    beforeAnalyse: 'w3c_validator_module__beforeAnalyse',
    onResult: 'w3c_validator_module__onResult',
    afterAnalyse: 'w3c_validator_module__afterAnalyse',
};
class W3cValidatorModule {
    constructor(userOptions = {}) {
        this.defaultOptions = {
            allowedTypes: ['error', 'warning'],
        };
        // Build dependencies.
        this.options = Object.assign(Object.assign({}, this.defaultOptions), userOptions);
    }
    get name() {
        return 'W3C validator';
    }
    get id() {
        return `w3c_validator`;
    }
    /**
     * {@inheritdoc}
     */
    init(config, context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.config = config;
            this.context = context;
            // Install lighthouse store.
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
            const options = {
                url: urlWrapper.url.toString(),
                format: 'text',
                data: yield this.fetchHtml(urlWrapper.url),
            };
            try {
                const result = yield validator(options);
                WebAuditEvent_1.WebAuditEvent.emit(exports.W3cValidatorModuleEvents.onResult, { module: this, url: urlWrapper, result: result });
                WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: result });
                this.options.allowedTypes.forEach((type) => {
                    var _a;
                    const count = result.messages.filter((item) => item.type === type);
                    if (count.length) {
                        (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.warning(`[W3C] ${count.length} ${type} found.`);
                    }
                });
                result.messages
                    .filter((item) => this.options.allowedTypes.includes(item.type))
                    .forEach((item) => {
                    var _a, _b;
                    item.url = urlWrapper.url.toString();
                    (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.add('w3c_validator', this.context, item);
                });
                return true;
            }
            catch (error) {
                return false;
            }
            return true;
        });
    }
    /**
     * Fetch html
     * @param {URL} url
     */
    fetchHtml(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(url.toString());
                const body = yield response.text();
                return body;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    /**
     * Finish analyse process.
     *
     * @returns {Promise<any>}
     */
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.W3cValidatorModule = W3cValidatorModule;
