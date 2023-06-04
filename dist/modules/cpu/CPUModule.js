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
exports.CPUModule = exports.CPUModuleEvents = void 0;
const WebAuditEvent_1 = require("../../core/WebAuditEvent");
const AbstractPuppeteerJourneyModule_1 = require("../../journey/AbstractPuppeteerJourneyModule");
const AbstractPuppeteerJourney_1 = require("../../journey/AbstractPuppeteerJourney");
const ModuleInterface_1 = require("../ModuleInterface");
const os = require('os-utils');
exports.CPUModuleEvents = {
    createCPUModule: 'cpu__createCPUModule',
    beforeAnalyse: 'cpu__beforeAnalyse',
    onResult: 'cpu__onResult',
    onBrowserClose: 'cpu__onBrowserClose',
    onBrowserLaunch: 'cpu__onBrowserLaunch',
    onNewPage: 'cpu__onNewPage',
    afterAnalyse: 'cpu__afterAnalyse',
};
class CPUModule extends AbstractPuppeteerJourneyModule_1.AbstractPuppeteerJourneyModule {
    constructor() {
        super(...arguments);
        this.stock = [];
        this.currentStep = 0;
        this.currentContext = 0;
    }
    get name() {
        return 'CPU';
    }
    get id() {
        return `cpu`;
    }
    /**
     * {@inheritdoc}
     */
    init(config, context) {
        var _a, _b;
        this.config = config;
        this.context = context;
        // Install eco index store.
        (_a = this.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('cpu', this.context, {
            url: 'Url',
            time: 'Time',
            cpu: 'CPU use average (%)',
        });
        // Install eco index best_practices.
        (_b = this.config.storage) === null || _b === void 0 ? void 0 : _b.installStore('cpu_history', this.context, {
            url: 'Url',
            time: 'Time',
            step: 'Step',
            context: 'Context',
            cpu: 'CPU usage (%)',
        });
        // Emit.
        WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.createCPUModule, { module: this });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        // Init ecoindex data.
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, (data) => __awaiter(this, void 0, void 0, function* () { return this.startTimer(); }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_AFTER_STEP, (data) => __awaiter(this, void 0, void 0, function* () { return this.currentStep++; }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, (data) => __awaiter(this, void 0, void 0, function* () { return this.currentContext++; }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_END, (data) => __awaiter(this, void 0, void 0, function* () { return this.stopTimer(); }));
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        const result = this.getResult(urlWrapper);
        WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.onResult, { module: this, url: urlWrapper, result: result });
        WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.afterAnalyse, { module: this, url: urlWrapper, result: result });
        WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.afterAnalyse, { module: this, url: urlWrapper });
        return (result === null || result === void 0 ? void 0 : result.success) || false;
    }
    /**
     * Start timer
     */
    startTimer() {
        const firstTime = new Date().getTime();
        this.currentStep = 0;
        this.currentContext = 0;
        this.interval = setInterval(() => {
            const usage = {
                time: (new Date().getTime() - firstTime) / 1000,
                step: this.currentStep,
                context: this.currentContext,
            };
            os.cpuUsage((value) => {
                const cpu = value * 100;
                usage.cpu = cpu;
            });
            this.stock.push(usage);
        }, 100);
    }
    /**
     * Stop timer.
     */
    stopTimer() {
        clearInterval(this.interval);
    }
    /**
     * Return the result.
     *
     * @param {UrlWrapper} urlWrapper
     * @returns {any}
     * @private
     */
    getResult(urlWrapper) {
        var _a, _b, _c;
        this.stock.forEach((item) => {
            var _a, _b;
            (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.add('cpu_history', this.context, Object.assign(Object.assign({}, item), {
                url: urlWrapper.url,
            }));
        });
        // Average.
        const averageData = Object.assign(Object.assign({}, this.getAverageData()), {
            url: urlWrapper.url,
        });
        (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.add('cpu', this.context, averageData);
        (_c = this.config) === null || _c === void 0 ? void 0 : _c.logger.result('CPU', averageData, urlWrapper.url.toString());
        return averageData;
    }
    /**
     * Return average data.
     *
     * @returns {{cpu: number, time: any}}
     * @private
     */
    getAverageData() {
        return {
            time: this.stock.at(-1).time,
            cpu: this.stock.reduce((sum, currentValue) => {
                if (currentValue === null || currentValue === void 0 ? void 0 : currentValue.cpu) {
                    return sum + currentValue.cpu;
                }
                return sum;
            }, 0) / this.stock.length,
        };
    }
}
exports.CPUModule = CPUModule;
