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
        this.hasValue = false;
        this.isPaused = false;
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
    init(context) {
        var _a, _b, _c, _d, _e;
        this.context = context;
        // Install eco index store.
        (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.config.storage) === null || _b === void 0 ? void 0 : _b.installStore('cpu', this.context, {
            url: 'Url',
            context: 'context',
            time: 'Time',
            cpu: 'CPU use average (%)',
        });
        // Install eco index best_practices.
        (_d = (_c = this.context) === null || _c === void 0 ? void 0 : _c.config.storage) === null || _d === void 0 ? void 0 : _d.installStore('cpu_history', this.context, {
            url: 'Url',
            time: 'Time',
            step: 'Step',
            context: 'Context',
            cpu: 'CPU usage (%)',
        });
        // Emit.
        (_e = this.context) === null || _e === void 0 ? void 0 : _e.eventBus.emit(exports.CPUModuleEvents.createCPUModule, { module: this });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        var _a, _b;
        // Init ecoindex data.
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, () => __awaiter(this, void 0, void 0, function* () { return this.startTimer(); }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_AFTER_STEP, () => __awaiter(this, void 0, void 0, function* () { return this.currentStep++; }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, () => __awaiter(this, void 0, void 0, function* () { return this.currentContext++; }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_END, () => __awaiter(this, void 0, void 0, function* () { return this.stopTimer(true); }));
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_ERROR, () => __awaiter(this, void 0, void 0, function* () { return this.stopTimer(false); }));
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.eventBus.on(ModuleInterface_1.ModuleEvents.startsComputing, () => this.pauseTimer());
        (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.on(ModuleInterface_1.ModuleEvents.endsComputing, () => this.unpauseTimer());
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        var _a, _b, _c, _d, _e;
        this.pauseTimer();
        if (!this.hasValue) {
            return Promise.resolve(false);
        }
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.eventBus.emit(exports.CPUModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.emit(ModuleInterface_1.ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        const result = this.getResult(urlWrapper);
        (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(exports.CPUModuleEvents.onResult, { module: this, url: urlWrapper, result: result });
        (_d = this.context) === null || _d === void 0 ? void 0 : _d.eventBus.emit(exports.CPUModuleEvents.afterAnalyse, { module: this, url: urlWrapper, result: result });
        (_e = this.context) === null || _e === void 0 ? void 0 : _e.eventBus.emit(ModuleInterface_1.ModuleEvents.afterAnalyse, { module: this, url: urlWrapper });
        return Promise.resolve((result === null || result === void 0 ? void 0 : result.success) || false);
    }
    /**
     * Start timer
     */
    startTimer() {
        this.hasValue = false;
        const firstTime = new Date().getTime();
        this.currentStep = 0;
        this.currentContext = 0;
        this.stock = [];
        this.isPaused = false;
        this.interval = setInterval(() => {
            if (!this.isPaused) {
                const usage = {
                    time: (new Date().getTime() - firstTime) / 1000,
                    step: this.currentStep,
                    context: this.currentContext,
                };
                os.cpuUsage((value) => {
                    usage.cpu = value * 100;
                    if (!this.isPaused) {
                        this.stock.push(usage);
                    }
                });
            }
        }, 100);
    }
    /**
     * Pause timer.
     *
     * @private
     */
    pauseTimer() {
        this.isPaused = true;
    }
    /**
     * Unpause timer.
     *
     * @private
     */
    unpauseTimer() {
        this.isPaused = false;
    }
    /**
     * Stop timer.
     */
    stopTimer(hasValue) {
        this.hasValue = hasValue;
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
        this.pauseTimer();
        this.stock
            .filter((item) => {
            return item.context < this.journeyContexts.length && item.step < this.journeySteps.length;
        })
            .forEach((item) => {
            var _a, _b, _c;
            item.context = this.journeyContexts[item.context].name;
            item.step = this.journeySteps[item.step].name;
            item.url = urlWrapper.url;
            (_c = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.storage) === null || _c === void 0 ? void 0 : _c.add('cpu_history', this.context, item);
        });
        this.getAverageData(urlWrapper.url).forEach((average) => {
            var _a, _b, _c, _d, _e;
            (_c = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.storage) === null || _c === void 0 ? void 0 : _c.add('cpu', this.context, average);
            (_e = (_d = this.context) === null || _d === void 0 ? void 0 : _d.config) === null || _e === void 0 ? void 0 : _e.logger.result('CPU', average, urlWrapper.url.toString());
        });
        this.unpauseTimer();
        return true;
    }
    /**
     * Return average data.
     *
     * @returns {{cpu: number, time: any}}
     * @private
     */
    getAverageData(url) {
        const averages = [];
        this.journeyContexts.forEach((context) => {
            const contextStocks = this.stock.filter((item) => item.context === context.name);
            averages.push({
                cpu: contextStocks.reduce((sum, currentValue) => {
                    if (currentValue === null || currentValue === void 0 ? void 0 : currentValue.cpu) {
                        return sum + currentValue.cpu;
                    }
                    return sum;
                }, 0) / contextStocks.length,
                time: contextStocks[contextStocks.length - 1].time - contextStocks[0].time,
                context: context.name,
                url: url,
            });
        });
        return averages;
    }
}
exports.CPUModule = CPUModule;
