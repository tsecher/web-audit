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
exports.EcoIndex2Module = exports.EcoIndex2ModuleEvents = void 0;
const WebAuditEvent_1 = require("../../core/WebAuditEvent");
const AbstractPuppeteerJourneyModule_1 = require("../../journey/AbstractPuppeteerJourneyModule");
const AbstractPuppeteerJourney_1 = require("../../journey/AbstractPuppeteerJourney");
const ModuleInterface_1 = require("../ModuleInterface");
const W3C2Module_1 = require("../w3c2/W3C2Module");
const EcoindexStory_1 = require("./utils/EcoindexStory");
const ecoindex = require('ecoindex');
exports.EcoIndex2ModuleEvents = {
    createEcoIndexModule: 'ecoindex_module__createEcoIndexModule',
    beforeAnalyse: 'ecoindex_module__beforeAnalyse',
    onResult: 'ecoindex_module__onResult',
    onBrowserClose: 'ecoindex_module__onBrowserClose',
    onBrowserLaunch: 'ecoindex_module__onBrowserLaunch',
    onNewPage: 'ecoindex_module__onNewPage',
    afterAnalyse: 'ecoindex_module__afterAnalyse',
};
class EcoIndex2Module extends AbstractPuppeteerJourneyModule_1.AbstractPuppeteerJourneyModule {
    constructor() {
        super(...arguments);
        this.defaultOptions = {
            bestPracticesAnalyse: true,
        };
    }
    get name() {
        return 'Eco Index 2';
    }
    get id() {
        return `ecoindex2`;
    }
    /**
     * {@inheritdoc}
     */
    init(config, context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.config = config;
            this.context = context;
            // Install eco index store.
            (_a = this.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('ecoindex2', this.context, {
                url: 'Url',
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
            // Install eco index best_practices.
            (_b = this.config.storage) === null || _b === void 0 ? void 0 : _b.installStore('ecoindex_best_practices2', this.context, {
                url: 'Url',
                id: 'ID',
                comment: 'Message',
                complianceLevel: 'Compliance level',
                detailComment: 'Detail',
            });
            // Emit.
            WebAuditEvent_1.WebAuditEvent.emit(exports.EcoIndex2ModuleEvents.createEcoIndexModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            WebAuditEvent_1.WebAuditEvent.emit(W3C2Module_1.W3cValidatorModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            const results = this.getCleanResults(urlWrapper);
            results.forEach((result) => {
                var _a, _b;
                (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.add('ecoindex2', this.context, result);
            });
            WebAuditEvent_1.WebAuditEvent.emit(W3C2Module_1.W3cValidatorModuleEvents.onResult, { module: this, url: urlWrapper, result: results });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: results });
            return results.length > 0;
        });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        this.story = new EcoindexStory_1.EcoindexStory();
        // Init ecoindex data.
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, (data) => __awaiter(this, void 0, void 0, function* () { var _a; return (_a = this.story) === null || _a === void 0 ? void 0 : _a.start(data.wrapper.page); }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, (data) => __awaiter(this, void 0, void 0, function* () { var _b; return (_b = this.story) === null || _b === void 0 ? void 0 : _b.addStep(data.step); }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_END, (data) => __awaiter(this, void 0, void 0, function* () { var _c; return (_c = this.story) === null || _c === void 0 ? void 0 : _c.end(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_END); }));
    }
    getCleanResults(urlWrapper) {
        var _a;
        const allValidSteps = ((_a = this.story) === null || _a === void 0 ? void 0 : _a.getData().filter((step) => step.hasData())) || [];
        return allValidSteps.map((step) => {
            var _a, _b, _c, _d, _e, _f;
            const ecoindexValue = ecoindex.computeEcoIndex((_a = step.ecoindex) === null || _a === void 0 ? void 0 : _a.dom, (_b = step.ecoindex) === null || _b === void 0 ? void 0 : _b.request, (_c = step.ecoindex) === null || _c === void 0 ? void 0 : _c.size);
            return {
                url: urlWrapper.url,
                grade: ecoindex.getEcoIndexGrade(ecoindexValue),
                ecoIndex: ecoindexValue,
                domSize: (_d = step.ecoindex) === null || _d === void 0 ? void 0 : _d.dom,
                nbRequest: (_e = step.ecoindex) === null || _e === void 0 ? void 0 : _e.request,
                responsesSize: (_f = step.ecoindex) === null || _f === void 0 ? void 0 : _f.size,
                waterConsumption: ecoindex.computeGreenhouseGasesEmissionfromEcoIndex(ecoindexValue),
                greenhouseGasesEmission: ecoindex.computeWaterConsumptionfromEcoIndex(ecoindexValue),
            };
        });
    }
}
exports.EcoIndex2Module = EcoIndex2Module;
