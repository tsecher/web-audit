import {WebAuditContextClass} from '../../core/WebAuditContext';
import {AbstractPuppeteerJourneyModule} from '../../journey/AbstractPuppeteerJourneyModule';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '../../journey/AbstractPuppeteerJourney';
import {UrlWrapper} from '../../core/UrlWrapper';
import {ModuleEvents} from '../ModuleInterface';

const os = require('os-utils');

export const CPUModuleEvents: any = {
  createCPUModule: 'cpu__createCPUModule',
  beforeAnalyse: 'cpu__beforeAnalyse',
  onResult: 'cpu__onResult',
  onBrowserClose: 'cpu__onBrowserClose',
  onBrowserLaunch: 'cpu__onBrowserLaunch',
  onNewPage: 'cpu__onNewPage',
  afterAnalyse: 'cpu__afterAnalyse',
};

export class CPUModule extends AbstractPuppeteerJourneyModule {

  private interval?: any;
  private stock: any = [];
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
    journey.on(PuppeteerJourneyEvents.JOURNEY_START, async () => this.startTimer());
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
  private startTimer() {
    this.hasValue = false;
    const firstTime = new Date().getTime();
    this.currentStep = 0;
    this.currentContext = 0;
    this.stock = [];
    this.isPaused = false;

    this.interval = setInterval(() => {
      if (!this.isPaused) {
        const usage: any = {
          time: (new Date().getTime() - firstTime) / 1000,
          step: this.currentStep,
          context: this.currentContext,
        };

        os.cpuUsage((value: any) => {
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
    this.stock
      .filter((item: any) => {
        return item.context < this.journeyContexts.length && item.step < this.journeySteps.length;
      })
      .forEach((item: any) => {
        item.context = this.journeyContexts[item.context].name;
        item.step = this.journeySteps[item.step].name;
        item.url = urlWrapper.url;
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
    this.journeyContexts.forEach((context: any) => {
      const contextStocks = this.stock.filter((item: any) => item.context === context.name);
      averages.push({
        cpu: contextStocks.reduce((sum: number, currentValue: any) => {
          if (currentValue?.cpu) {
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
