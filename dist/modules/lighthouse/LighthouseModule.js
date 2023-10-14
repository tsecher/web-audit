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
        this.reports = [];
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
    init(context) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.context = context;
            // Install lighthouse store.
            (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.config.storage) === null || _b === void 0 ? void 0 : _b.installStore('lighthouse', this.context, {
                url: 'Url',
                context: 'Context',
                performance: 'Performance',
                seo: 'SEO',
                'best-practices': 'Best Practices',
                accessibility: 'Accessibility',
            });
            // Emit.
            (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(exports.LighthouseModuleEvents.createLighthouseModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.context) === null || _a === void 0 ? void 0 : _a.eventBus.emit(ModuleInterface_1.ModuleEvents.startsComputing, { module: this });
            this.reports.forEach((contextReport, index) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                if (!contextReport) {
                    return;
                }
                // Report
                const report = {};
                report.context = this.journeyContexts[index].name;
                (_b = (_a = this.getOptions()) === null || _a === void 0 ? void 0 : _a.onlyCategories) === null || _b === void 0 ? void 0 : _b.map((cat) => {
                    var _a, _b;
                    try {
                        report[cat] = contextReport.report.categories[cat].score;
                    }
                    catch (error) {
                        (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.logger.error(error);
                    }
                });
                const eventData = {
                    module: this,
                    url: urlWrapper,
                    result: contextReport
                };
                (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(exports.LighthouseModuleEvents.onResult, eventData);
                (_d = this.context) === null || _d === void 0 ? void 0 : _d.eventBus.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, eventData);
                if (report === null || report === void 0 ? void 0 : report.performance) {
                    (_f = (_e = this.context) === null || _e === void 0 ? void 0 : _e.config) === null || _f === void 0 ? void 0 : _f.logger.result(`Lighthouse`, report, urlWrapper.url.toString());
                }
                else {
                    (_h = (_g = this.context) === null || _g === void 0 ? void 0 : _g.config) === null || _h === void 0 ? void 0 : _h.logger.error(`Could not analyse page`);
                    (_k = (_j = this.context) === null || _j === void 0 ? void 0 : _j.config) === null || _k === void 0 ? void 0 : _k.logger.error(report);
                }
                report.url = urlWrapper.url.toString();
                (_o = (_m = (_l = this.context) === null || _l === void 0 ? void 0 : _l.config) === null || _m === void 0 ? void 0 : _m.storage) === null || _o === void 0 ? void 0 : _o.add('lighthouse', this.context, report);
                (_p = this.context) === null || _p === void 0 ? void 0 : _p.eventBus.emit(exports.LighthouseModuleEvents.afterAnalyse, eventData);
                (_q = this.context) === null || _q === void 0 ? void 0 : _q.eventBus.emit(ModuleInterface_1.ModuleEvents.afterAnalyse, eventData);
            });
            (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.emit(ModuleInterface_1.ModuleEvents.endsComputing, { module: this });
            return true;
        });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, (data) => __awaiter(this, void 0, void 0, function* () {
            this.reports = [];
        }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, (data) => __awaiter(this, void 0, void 0, function* () { return this.launchLighthouse(data.wrapper); }));
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.context) === null || _a === void 0 ? void 0 : _a.eventBus.emit(ModuleInterface_1.ModuleEvents.startsComputing, { module: this });
            const browser = yield wrapper.getBrowser();
            const endpoint = new URL(browser.wsEndpoint());
            const options = this.getOptions();
            options.port = endpoint.port;
            const result = yield lighthouse(wrapper.page.url(), options, { extends: 'lighthouse:default' });
            this.reports.push({
                report: JSON.parse(ReportGenerator.generateReport(result.lhr, 'json')),
                html: ReportGenerator.generateReport(result.lhr, 'html'),
            });
            (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.emit(ModuleInterface_1.ModuleEvents.endsComputing, { module: this });
        });
    }
}
exports.LighthouseModule = LighthouseModule;
