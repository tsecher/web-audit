import { AbstractPuppeteerJourneyModule } from '../../journey/AbstractPuppeteerJourneyModule';
import { PuppeteerJourneyEvents } from '../../journey/AbstractPuppeteerJourney';
import { ModuleEvents } from '../ModuleInterface';
export const CPUModuleEvents = {
    createCPUModule: 'cpu__createCPUModule',
    beforeAnalyse: 'cpu__beforeAnalyse',
    onResult: 'cpu__onResult',
    onBrowserClose: 'cpu__onBrowserClose',
    onBrowserLaunch: 'cpu__onBrowserLaunch',
    onNewPage: 'cpu__onNewPage',
    afterAnalyse: 'cpu__afterAnalyse',
};
export class CPUModule extends AbstractPuppeteerJourneyModule {
    interval;
    snapshots = [];
    currentStep = 0;
    currentContext = 0;
    hasValue = false;
    isPaused = false;
    cpuCount = 1;
    durationsMetrics = [
        // 'Timestamp',
        // 'AudioHandlers',
        // 'Documents',
        // 'Frames',
        // 'JSEventListeners',
        // 'LayoutObjects',
        // 'MediaKeySessions',
        // 'MediaKeys',
        // 'Nodes',
        // 'Resources',
        // 'ContextLifecycleStateObservers',
        // 'V8PerContextDatas',
        // 'WorkerGlobalScopes',
        // 'UACSSResources',
        // 'RTCPeerConnections',
        // 'ResourceFetchers',
        // 'AdSubframes',
        // 'DetachedScriptStates',
        // 'ArrayBufferContents',
        // 'LayoutCount',
        // 'RecalcStyleCount',
        'LayoutDuration',
        'RecalcStyleDuration',
        'DevToolsCommandDuration',
        'ScriptDuration',
        'V8CompileDuration',
        'TaskDuration',
        'TaskOtherDuration',
        // 'ThreadTime',
        // 'ProcessTime',
        // 'JSHeapUsedSize',
        // 'JSHeapTotalSize',
        // 'FirstMeaningfulPaint',
        // 'DomContentLoaded',
        // 'NavigationStart',
    ];
    mainDurationMetrics = [
        'LayoutDuration',
        'RecalcStyleDuration',
        'ScriptDuration',
    ];
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
        this.context = context;
        const os = require('os-utils');
        this.cpuCount = os.cpuCount();
        // Install eco index store.
        this.context?.config.storage?.installStore('cpu', this.context, {
            url: 'Url',
            context: 'context',
            time: 'Time',
            cpu: 'CPU use average (%)',
        });
        // Install eco index best_practices.
        this.context?.config.storage?.installStore('cpu_history', this.context, {
            url: 'Url',
            time: 'Time',
            step: 'Step',
            context: 'Context',
            cpu: 'CPU usage (%)',
        });
        // Emit.
        this.context?.eventBus.emit(CPUModuleEvents.createCPUModule, { module: this });
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        // Init ecoindex data.
        journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data) => this.startTimer(data));
        journey.on(PuppeteerJourneyEvents.JOURNEY_AFTER_STEP, async () => this.currentStep++);
        journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async () => this.currentContext++);
        journey.on(PuppeteerJourneyEvents.JOURNEY_END, async () => this.stopTimer(true));
        journey.on(PuppeteerJourneyEvents.JOURNEY_ERROR, async () => this.stopTimer(false));
        this.context?.eventBus.on(ModuleEvents.startsComputing, () => this.pauseTimer());
        this.context?.eventBus.on(ModuleEvents.endsComputing, () => this.unpauseTimer());
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        this.pauseTimer();
        if (!this.hasValue) {
            return Promise.resolve(false);
        }
        this.context?.eventBus.emit(CPUModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        this.context?.eventBus.emit(ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        const result = this.getResult(urlWrapper);
        this.context?.eventBus.emit(CPUModuleEvents.onResult, { module: this, url: urlWrapper, result: result });
        this.context?.eventBus.emit(CPUModuleEvents.afterAnalyse, { module: this, url: urlWrapper, result: result });
        this.context?.eventBus.emit(ModuleEvents.afterAnalyse, { module: this, url: urlWrapper });
        return Promise.resolve(result?.success || false);
    }
    /**
     * Start timer
     */
    async startTimer(data) {
        const cdp = await data.wrapper.page.target().createCDPSession();
        this.hasValue = false;
        this.currentStep = 0;
        this.currentContext = 0;
        this.snapshots = [];
        this.isPaused = false;
        await cdp.send('Performance.enable', {
            timeDomain: 'timeTicks',
        });
        this.addMetrics(cdp);
        this.interval = setInterval(async () => {
            if (!this.isPaused) {
                this.addMetrics(cdp);
            }
        }, 100);
    }
    /**
     * Add metrics.
     *
     * @param cdp
     * @returns {Promise<void>}
     * @protected
     */
    async addMetrics(cdp) {
        let metrics;
        try {
            metrics = await cdp.send('Performance.getMetrics');
        }
        catch (err) {
            this.stopTimer(true);
            return;
        }
        this.snapshots.push({
            metrics: this.getMetricsValues(metrics),
            step: this.currentStep,
            context: this.currentContext,
            timestamp: 0,
            usage: 0,
        });
    }
    /**
     * Return metrics from browser.
     *
     * @param metrics
     * @returns {{timestamp: number, activeTime: number}}
     * @protected
     */
    getMetricsValues(metrics) {
        const values = {};
        metrics.metrics
            .forEach((item) => {
            values[item.name] = item.value;
        });
        return values;
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
        this.snapshots.sort((snapA, snapB) => snapA.metrics.Timestamp - snapB.metrics.Timestamp);
        const firstTimeStamp = this.snapshots[0].metrics.Timestamp;
        this.snapshots[0].metrics.Timestamp = 0;
        for (let i = this.snapshots.length - 1; i > 0; i--) {
            this.snapshots[i].timestamp = this.snapshots[i].metrics.Timestamp - firstTimeStamp;
            Object.keys(this.snapshots[i].metrics).forEach((metricName) => {
                this.snapshots[i].metrics[metricName] -= this.snapshots[i - 1].metrics[metricName];
            });
            this.snapshots[i].usage = this.getSnapshotUsage(this.snapshots[i]);
        }
        this.snapshots.forEach((snapshot) => {
            const item = {
                url: urlWrapper.url,
                time: snapshot.timestamp,
                step: this.journeySteps[snapshot.step]?.name || '',
                context: this.journeyContexts[snapshot.context]?.name || '',
                cpu: snapshot.usage,
            };
            this.context?.config?.storage?.add('cpu_history', this.context, item);
        });
        this.getAverageData(urlWrapper.url).forEach((average) => {
            this.context?.config?.storage?.add('cpu', this.context, average);
            this.context?.config?.logger.result('CPU', average, urlWrapper.url.toString());
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
            const time = contextStocks[contextStocks.length - 1].timestamp - contextStocks[0].timestamp;
            const cumulActiveTime = contextStocks.reduce((sum, currentValue) => {
                if (currentValue?.usage) {
                    return sum + currentValue.usage;
                }
                return sum;
            }, 0);
            averages.push({
                cpu: cumulActiveTime / contextStocks.length,
                time: time,
                context: context.name,
                url: url,
            });
        });
        return averages;
    }
    /**
     * Return snappshot usage value.
     *
     * @param {CPUUsageSnapshot} snapshot
     * @returns {number}
     * @private
     */
    getSnapshotUsage(snapshot) {
        let all = 0;
        this.durationsMetrics.forEach((metricName) => {
            all += snapshot.metrics[metricName];
        });
        // The all time is the cumulation of all time of all cpus used during the snapshot session.
        return all / this.cpuCount / snapshot.metrics.Timestamp * 100;
    }
}
