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
exports.LighthouseModule = exports.LighthouseModuleEvents = void 0;
const WebAuditEvent_1 = require("../../core/WebAuditEvent");
const ChromeLauncher = require('chrome-launcher');
const lighthouse = require('lighthouse');
exports.LighthouseModuleEvents = {
    createLighthouseModule: 'lighthouse_module__createLighthouseModule',
    beforeAnalyse: 'lighthouse_module__beforeAnalyse',
    onResult: 'lighthouse_module__onResult',
    onBrowserClose: 'lighthouse_module__onBrowserClose',
    onBrowserLaunch: 'lighthouse_module__onBrowserLaunch',
    onNewPage: 'lighthouse_module__onNewPage',
    afterAnalyse: 'lighthouse_module__afterAnalyse',
};
class LighthouseModule {
    constructor(userOptions = {}) {
        this.defaultOptions = {};
        // Build dependencies.
        this.options = Object.assign(Object.assign({}, this.defaultOptions), userOptions);
    }
    get name() {
        return 'Google Lighthouse';
    }
    get id() {
        return `lighthouse`;
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
            (_a = this.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('lighthouse', this.context, {
                url: 'Url',
                performance: 'Performance',
                seo: 'SEO',
                'best-practices': 'Best Practices',
                accessibility: 'Accessibility',
            });
            // Emit.
            WebAuditEvent_1.WebAuditEvent.emit(exports.LighthouseModuleEvents.createLighthouseModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(url) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            WebAuditEvent_1.WebAuditEvent.emit(exports.LighthouseModuleEvents.beforeAnalyse, { module: this });
            const browser = yield this.getBrowser();
            const options = {
                output: 'json',
                onlyCategories: ['performance', 'seo', 'best-practices', 'accessibility'],
                port: browser.port,
            };
            const runnerResult = yield lighthouse(url, options, {
                extends: 'lighthouse:default',
            });
            const result = JSON.parse(runnerResult.report);
            // Report
            const report = {};
            options.onlyCategories.map((cat) => {
                var _a;
                try {
                    report[cat] = result.categories[cat].score;
                }
                catch (error) {
                    (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.error(error);
                }
            });
            WebAuditEvent_1.WebAuditEvent.emit(exports.LighthouseModuleEvents.onResult, { module: this, url: url, browser: browser, result: result });
            if (report === null || report === void 0 ? void 0 : report.performance) {
                const logs = Object.keys(report)
                    .map((key) => `${key} : ${report[key]}`);
                (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.success(`Lighthouse : ${logs.join(' | ')}`, url.toString());
            }
            else {
                (_b = this.config) === null || _b === void 0 ? void 0 : _b.logger.error(`Could not analyse page`);
                (_c = this.config) === null || _c === void 0 ? void 0 : _c.logger.error(report);
            }
            report.url = url.toString();
            (_e = (_d = this.config) === null || _d === void 0 ? void 0 : _d.storage) === null || _e === void 0 ? void 0 : _e.add('lighthouse', this.context, report);
            WebAuditEvent_1.WebAuditEvent.emit(exports.LighthouseModuleEvents.afterAnalyse, { module: this, url: url });
            return true;
        });
    }
    /**
     * Finish analyse process.
     *
     * @returns {Promise<any>}
     */
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield this.getBrowser();
            yield (browser === null || browser === void 0 ? void 0 : browser.kill());
            WebAuditEvent_1.WebAuditEvent.emit(exports.LighthouseModuleEvents.onBrowserClose, { module: this, browser: this.browser });
        });
    }
    /**
     * Return browser.
     *
     * @returns {Promise<any>}
     */
    getBrowser() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                return new Promise((resolve) => resolve(this.browser));
            }
            // Launch browser.
            (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.message('First, launch browser');
            this.browser = yield ChromeLauncher.launch({
                chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
            });
            WebAuditEvent_1.WebAuditEvent.emit(exports.LighthouseModuleEvents.onBrowserLaunch, { module: this, browser: this.browser });
            return this.browser;
        });
    }
}
exports.LighthouseModule = LighthouseModule;
