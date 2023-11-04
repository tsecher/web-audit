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
        this.snapshots = [];
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
        journey.on(AbstractPuppeteerJourney_1.PuppeteerJourneyEvents.JOURNEY_START, (data) => __awaiter(this, void 0, void 0, function* () { return this.startTimer(data); }));
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
    startTimer(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cdp = yield data.wrapper.page.target().createCDPSession();
            this.hasValue = false;
            this.currentStep = 0;
            this.currentContext = 0;
            this.snapshots = [];
            this.isPaused = false;
            yield cdp.send('Performance.enable', {
                timeDomain: 'timeTicks',
            });
            const { timestamp: startTime, activeTime: initialActiveTime, } = this.processMetrics(yield cdp.send('Performance.getMetrics'));
            let cumulativeActiveTime = initialActiveTime;
            let lastTimestamp = startTime;
            this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                const { timestamp, activeTime } = this.processMetrics(yield cdp.send('Performance.getMetrics'));
                const frameDuration = timestamp - lastTimestamp;
                let usage = (activeTime - cumulativeActiveTime) / frameDuration;
                cumulativeActiveTime = activeTime;
                if (usage > 1) {
                    usage = 1;
                }
                if (!this.isPaused) {
                    this.snapshots.push({
                        timestamp,
                        usage,
                        step: this.currentStep,
                        context: this.currentContext,
                    });
                }
                lastTimestamp = timestamp;
            }), 100);
        });
    }
    /**
     * Return metrics from browser.
     *
     * @param metrics
     * @returns {{timestamp: number, activeTime: number}}
     * @protected
     */
    processMetrics(metrics) {
        var _a;
        const activeTime = metrics.metrics.filter((metric) => metric.name.includes('Duration')).map((metric) => metric.value).reduce((metricA, metricB) => metricA + metricB);
        return {
            timestamp: ((_a = metrics.metrics.find((metric) => metric.name === 'Timestamp')) === null || _a === void 0 ? void 0 : _a.value) || 0,
            activeTime,
        };
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
        const firstTime = this.snapshots[0].timestamp;
        this.snapshots.forEach((snapshot) => {
            var _a, _b, _c, _d, _e;
            const item = {
                url: urlWrapper.url,
                time: snapshot.timestamp - firstTime,
                step: ((_a = this.journeySteps[snapshot.step]) === null || _a === void 0 ? void 0 : _a.name) || '',
                context: ((_b = this.journeyContexts[snapshot.context]) === null || _b === void 0 ? void 0 : _b.name) || '',
                cpu: snapshot.usage * 100,
            };
            (_e = (_d = (_c = this.context) === null || _c === void 0 ? void 0 : _c.config) === null || _d === void 0 ? void 0 : _d.storage) === null || _e === void 0 ? void 0 : _e.add('cpu_history', this.context, item);
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
        this.journeyContexts.forEach((context, index) => {
            const contextStocks = this.snapshots.filter((item) => item.context === index);
            averages.push({
                cpu: contextStocks.reduce((sum, currentValue) => {
                    if (currentValue === null || currentValue === void 0 ? void 0 : currentValue.usage) {
                        return sum + currentValue.usage;
                    }
                    return sum;
                }, 0) * 100 / contextStocks.length,
                time: contextStocks[contextStocks.length - 1].timestamp - contextStocks[0].timestamp,
                context: context.name,
                url: url,
            });
        });
        return averages;
    }
}
exports.CPUModule = CPUModule;
