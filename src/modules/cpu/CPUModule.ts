import {WebAuditContextClass} from '../../core/WebAuditContext';
import {AbstractPuppeteerJourneyModule} from '../../journey/AbstractPuppeteerJourneyModule';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '../../journey/AbstractPuppeteerJourney';
import {UrlWrapper} from '../../core/UrlWrapper';
import {ModuleEvents} from '../ModuleInterface';

export const CPUModuleEvents: any = {
  createCPUModule: 'cpu__createCPUModule',
  beforeAnalyse: 'cpu__beforeAnalyse',
  onResult: 'cpu__onResult',
  onBrowserClose: 'cpu__onBrowserClose',
  onBrowserLaunch: 'cpu__onBrowserLaunch',
  onNewPage: 'cpu__onNewPage',
  afterAnalyse: 'cpu__afterAnalyse',
};


interface CPUUsageSnapshot {
  timestamp: number;
  usage: number;
  step: number;
  context: number;
}

export interface CPUStats {
  average: number;
  snapshots: CPUUsageSnapshot[];
}

export class CPUModule extends AbstractPuppeteerJourneyModule {

  private interval?: any;
  private snapshots: CPUUsageSnapshot[] = [];
  private currentStep = 0;
  private currentContext = 0;
  private hasValue = false;
  private isPaused = false;

  get name(): string {
    return 'CPU';
  }

  get id(): string {
    return `cpu`;
  }

  /**
   * {@inheritdoc}
   */
  init(context: WebAuditContextClass): void {
    this.context = context;

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
    this.context?.eventBus.emit(CPUModuleEvents.createCPUModule, {module: this});
  }

  /**
   * {@inheritdoc}
   */
  initEvents(journey: AbstractPuppeteerJourney): void {
    // Init ecoindex data.
    journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data: any) => this.startTimer(data));
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
  analyse(urlWrapper: UrlWrapper): Promise<boolean> {
    this.pauseTimer();
    if (!this.hasValue) {
      return Promise.resolve(false);
    }
    this.context?.eventBus.emit(CPUModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});
    this.context?.eventBus.emit(ModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});

    const result: any = this.getResult(urlWrapper);
    this.context?.eventBus.emit(CPUModuleEvents.onResult, {module: this, url: urlWrapper, result: result});
    this.context?.eventBus.emit(CPUModuleEvents.afterAnalyse, {module: this, url: urlWrapper, result: result});
    this.context?.eventBus.emit(ModuleEvents.afterAnalyse, {module: this, url: urlWrapper});

    return Promise.resolve(result?.success || false);
  }

  /**
   * Start timer
   */
  async startTimer(data: any) {

    const cdp = await data.wrapper.page.target().createCDPSession();
    this.hasValue = false;
    this.currentStep = 0;
    this.currentContext = 0;
    this.snapshots = [];
    this.isPaused = false;

    await cdp.send('Performance.enable', {
      timeDomain: 'timeTicks',
    });

    const {
      timestamp: startTime,
      activeTime: initialActiveTime,
    } = this.processMetrics(await cdp.send('Performance.getMetrics'));

    let cumulativeActiveTime = initialActiveTime;

    let lastTimestamp = startTime;
    this.interval = setInterval(async () => {
      const {timestamp, activeTime} = this.processMetrics(await cdp.send('Performance.getMetrics'));
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
    }, 100);
  }


  /**
   * Return metrics from browser.
   *
   * @param metrics
   * @returns {{timestamp: number, activeTime: number}}
   * @protected
   */
  protected processMetrics(metrics: any): {
    timestamp: number;
    activeTime: number;
  } {
    const activeTime = metrics.metrics.filter((metric: any) => metric.name.includes('Duration')).map((metric: any) => metric.value).reduce((metricA: any, metricB: any) => metricA + metricB);
    return {
      timestamp: metrics.metrics.find((metric: any) => metric.name === 'Timestamp')?.value || 0,
      activeTime,
    };
  }

  /**
   * Pause timer.
   *
   * @private
   */
  private pauseTimer() {
    this.isPaused = true;
  }

  /**
   * Unpause timer.
   *
   * @private
   */
  private unpauseTimer() {
    this.isPaused = false;
  }

  /**
   * Stop timer.
   */
  private stopTimer(hasValue: boolean) {
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
  private getResult(urlWrapper: UrlWrapper): any {
    this.pauseTimer();

    const firstTime = this.snapshots[0].timestamp;

    this.snapshots.forEach((snapshot: CPUUsageSnapshot) => {
      const item = {
        url: urlWrapper.url,
        time: snapshot.timestamp - firstTime,
        step: this.journeySteps[snapshot.step]?.name || '',
        context: this.journeyContexts[snapshot.context]?.name || '',
        cpu: snapshot.usage * 100,
      };
      this.context?.config?.storage?.add('cpu_history', this.context, item);
    });
    this.getAverageData(urlWrapper.url).forEach((average: any) => {
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
  private getAverageData(url: URL) {
    const averages: any[] = [];
    this.journeyContexts.forEach((context: any, index: number) => {
      const contextStocks = this.snapshots.filter((item: CPUUsageSnapshot) => item.context === index);
      averages.push({
        cpu: contextStocks.reduce((sum: number, currentValue: CPUUsageSnapshot) => {
          if (currentValue?.usage) {
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

