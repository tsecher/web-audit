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
exports.EcoIndexModule = exports.EcoIndexModuleEvents = void 0;
const ecoindex_puppeteer_1 = require("ecoindex_puppeteer");
const AbstractPuppeteerJourneyModule_1 = require("../../journey/AbstractPuppeteerJourneyModule");
const AbstractPuppeteerJourney_1 = require("../../journey/AbstractPuppeteerJourney");
const ModuleInterface_1 = require("../ModuleInterface");
const ecoindex = require('ecoindex');
exports.EcoIndexModuleEvents = {
    createEcoIndexModule: 'ecoindex_module__createEcoIndexModule',
    beforeAnalyse: 'ecoindex_module__beforeAnalyse',
    onResult: 'ecoindex_module__onResult',
    onBrowserClose: 'ecoindex_module__onBrowserClose',
    onBrowserLaunch: 'ecoindex_module__onBrowserLaunch',
    onNewPage: 'ecoindex_module__onNewPage',
    afterAnalyse: 'ecoindex_module__afterAnalyse',
};
class EcoIndexModule extends AbstractPuppeteerJourneyModule_1.AbstractPuppeteerJourneyModule {
    constructor() {
        super(...arguments);
        this.hasValue = false;
        this.defaultOptions = {
            bestPracticesAnalyse: true,
        };
    }
    get name() {
        return 'Eco Index';
    }
    get id() {
        return `ecoindex`;
    }
    /**
     * {@inheritdoc}
     */
    init(context) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.context = context;
            // Install eco index store.
            (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.config.storage) === null || _b === void 0 ? void 0 : _b.installStore('ecoindex', this.context, {
                url: 'Url',
                context: 'Context',
                grade: 'Grade',
                ecoIndex: 'Ecoindex',
                domSize: 'Dom Size',
                nbRequest: 'NB request',
                responsesSize: 'Responses Size',
                responsesSizeUncompress: 'Responses Size Uncompress',
                waterConsumption: 'Water consumption',
                greenhouseGasesEmission: 'Greenhouse Gases Emission',
                nbBestPracticesToCorrect: 'Nb Best practices to correct',
            });
            // Emit.
            (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(exports.EcoIndexModuleEvents.createEcoIndexModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasValue) {
                return Promise.resolve(false);
            }
            (_a = this.context) === null || _a === void 0 ? void 0 : _a.eventBus.emit(exports.EcoIndexModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.emit(ModuleInterface_1.ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(ModuleInterface_1.ModuleEvents.startsComputing, { module: this });
            const results = this.getCleanResults(urlWrapper);
            results.forEach((result, index) => {
                var _a, _b, _c, _d, _e;
                result.context = this.journeyContexts[index].name;
                (_c = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.storage) === null || _c === void 0 ? void 0 : _c.add('ecoindex', this.context, result);
                (_e = (_d = this.context) === null || _d === void 0 ? void 0 : _d.config) === null || _e === void 0 ? void 0 : _e.logger.result(`Ecoindex`, result, urlWrapper.url.toString());
            });
            (_d = this.context) === null || _d === void 0 ? void 0 : _d.eventBus.emit(ModuleInterface_1.ModuleEvents.endsComputing, { module: this });
            (_e = this.context) === null || _e === void 0 ? void 0 : _e.eventBus.emit(exports.EcoIndexModuleEvents.onResult, { module: this, url: urlWrapper, result: results });
            (_f = this.context) === null || _f === void 0 ? void 0 : _f.eventBus.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: results });
            return results.length > 0;
        });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        this.story = new ecoindex_puppeteer_1.EcoIndexStory();
        // Init ecoindex data.
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, (data) => __awaiter(this, void 0, void 0, function* () { var _a; return (_a = this.story) === null || _a === void 0 ? void 0 : _a.start(data.wrapper.page); }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, (data) => __awaiter(this, void 0, void 0, function* () { var _b; return (_b = this.story) === null || _b === void 0 ? void 0 : _b.addStep(data.step); }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_END, () => __awaiter(this, void 0, void 0, function* () {
            var _c;
            this.hasValue = true;
            (_c = this.story) === null || _c === void 0 ? void 0 : _c.stop(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_END, false);
        }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_ERROR, () => __awaiter(this, void 0, void 0, function* () {
            var _d;
            this.hasValue = false;
            (_d = this.story) === null || _d === void 0 ? void 0 : _d.stop(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_ERROR, false);
        }));
    }
    /**
     * Return clean results.
     *
     * @param {UrlWrapper} urlWrapper
     * @returns {any[]}
     * @private
     */
    getCleanResults(urlWrapper) {
        var _a;
        const allValidSteps = ((_a = this.story) === null || _a === void 0 ? void 0 : _a.getSteps().filter((step) => { var _a; return (_a = step.getMetrics()) === null || _a === void 0 ? void 0 : _a.hasData(); })) || [];
        // @ts-ignore
        return allValidSteps.map((step) => {
            const metrics = step.getMetrics();
            const ecoindexValue = ecoindex.computeEcoIndex(metrics === null || metrics === void 0 ? void 0 : metrics.getDomElementsCount(), metrics === null || metrics === void 0 ? void 0 : metrics.getRequestsCount(), (metrics === null || metrics === void 0 ? void 0 : metrics.getSize()) || 0);
            return {
                url: urlWrapper.url,
                grade: ecoindex.getEcoIndexGrade(ecoindexValue),
                ecoIndex: ecoindexValue,
                domSize: metrics === null || metrics === void 0 ? void 0 : metrics.getDomElementsCount(),
                nbRequest: metrics === null || metrics === void 0 ? void 0 : metrics.getRequestsCount(),
                responsesSize: metrics === null || metrics === void 0 ? void 0 : metrics.getSize(),
                greenhouseGasesEmission: ecoindex.computeGreenhouseGasesEmissionfromEcoIndex(ecoindexValue),
                waterConsumption: ecoindex.computeWaterConsumptionfromEcoIndex(ecoindexValue),
            };
        });
    }
}
exports.EcoIndexModule = EcoIndexModule;
