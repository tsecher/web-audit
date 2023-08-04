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
const AbstractPuppeteerJourneyModule_1 = require("../../journey/AbstractPuppeteerJourneyModule");
const AbstractPuppeteerJourney_1 = require("../../journey/AbstractPuppeteerJourney");
const WebAuditEvent_1 = require("../../core/WebAuditEvent");
const ModuleInterface_1 = require("../ModuleInterface");
const lighthouse = require('lighthouse');
const ReportGenerator = require('lighthouse/report/generator/report-generator');
/**
 * Lighthouse Module events.
 */
exports.LighthouseModuleEvents = {
    createLighthouseModule: 'lighthouse_module__createLighthouseModule',
    beforeAnalyse: 'lighthouse_module__beforeAnalyse',
    onResult: 'lighthouse_module__onResult',
    onBrowserClose: 'lighthouse_module__onBrowserClose',
    onBrowserLaunch: 'lighthouse_module__onBrowserLaunch',
    onNewPage: 'lighthouse_module__onNewPage',
    afterAnalyse: 'lighthouse_module__afterAnalyse',
};
/**
 * W3c Validator.
 */
class LighthouseModule extends AbstractPuppeteerJourneyModule_1.AbstractPuppeteerJourneyModule {
    constructor() {
        super(...arguments);
        this.defaultOptions = {
            output: 'json',
            onlyCategories: ['performance', 'seo', 'best-practices', 'accessibility'],
        };
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
    analyse(urlWrapper) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.lighthouseReport) {
                return false;
            }
            // Report
            const report = {};
            (_b = (_a = this.getOptions()) === null || _a === void 0 ? void 0 : _a.onlyCategories) === null || _b === void 0 ? void 0 : _b.map((cat) => {
                var _a;
                try {
                    report[cat] = this.lighthouseReport.report.categories[cat].score;
                }
                catch (error) {
                    (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.error(error);
                }
            });
            WebAuditEvent_1.WebAuditEvent.emit(exports.LighthouseModuleEvents.onResult, { module: this, url: urlWrapper, result: this.lighthouseReport });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: this.lighthouseReport });
            if (report === null || report === void 0 ? void 0 : report.performance) {
                (_c = this.config) === null || _c === void 0 ? void 0 : _c.logger.result(`Lighthouse`, report, urlWrapper.url.toString());
            }
            else {
                (_d = this.config) === null || _d === void 0 ? void 0 : _d.logger.error(`Could not analyse page`);
                (_e = this.config) === null || _e === void 0 ? void 0 : _e.logger.error(report);
            }
            report.url = urlWrapper.url.toString();
            (_g = (_f = this.config) === null || _f === void 0 ? void 0 : _f.storage) === null || _g === void 0 ? void 0 : _g.add('lighthouse', this.context, report);
            WebAuditEvent_1.WebAuditEvent.emit(exports.LighthouseModuleEvents.afterAnalyse, { module: this, url: urlWrapper });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.afterAnalyse, { module: this, url: urlWrapper });
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
        });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_END, (data) => __awaiter(this, void 0, void 0, function* () { return this.launchLighthouse(data.wrapper); }));
    }
    /**
     * Laucnh lighthouse.
     *
     * @param {PageWrapper} wrapper
     *   Page wrapper.
     *
     * @returns {Promise<undefined>}
     *
     * @private
     */
    launchLighthouse(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            this.lighthouseReport = null;
            const browser = yield wrapper.getBrowser();
            const endpoint = new URL(browser.wsEndpoint());
            const options = this.getOptions();
            options.port = endpoint.port;
            const result = yield lighthouse(wrapper.page.url(), options, { extends: 'lighthouse:default' });
            this.lighthouseReport = {
                report: JSON.parse(ReportGenerator.generateReport(result.lhr, 'json')),
                html: ReportGenerator.generateReport(result.lhr, 'html'),
            };
        });
    }
}
exports.LighthouseModule = LighthouseModule;
