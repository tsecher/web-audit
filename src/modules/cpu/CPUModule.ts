import {WebAuditConfigClass} from '../../core/WebAuditConfig';
import {WebAuditContextClass} from '../../core/WebAuditContext';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';
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

  get name(): string {
    return 'CPU';
  }

  get id(): string {
    return `cpu`;
  }

  /**
   * {@inheritdoc}
   */
  init(config: WebAuditConfigClass, context: WebAuditContextClass): void {
    this.config = config;
    this.context = context;

    // Install eco index store.
    this.config.storage?.installStore('cpu', this.context, {
      url: 'Url',
      time: 'Time',
      cpu: 'CPU use average (%)',
    });

    // Install eco index best_practices.
    this.config.storage?.installStore('cpu_history', this.context, {
      url: 'Url',
      time: 'Time',
      step: 'Step',
      context: 'Context',
      cpu: 'CPU usage (%)',
    });

    // Emit.
    Event.emit(CPUModuleEvents.createCPUModule, {module: this});
  }

  /**
   * {@inheritdoc}
   */
  initEvents(journey: AbstractPuppeteerJourney): void {
    // Init ecoindex data.
    journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data: any) => this.startTimer());
    journey.on(PuppeteerJourneyEvents.JOURNEY_AFTER_STEP, async (data: any) => this.currentStep++);
    journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data: any) => this.currentContext++);
    journey.on(PuppeteerJourneyEvents.JOURNEY_END, async (data: any) => this.stopTimer(true));
    journey.on(PuppeteerJourneyEvents.JOURNEY_ERROR, async (data: any) => this.stopTimer(false));
  }

  /**
   * {@inheritdoc}
   */
  analyse(urlWrapper: UrlWrapper): Promise<boolean> {
    if (!this.hasValue) {
      return Promise.resolve(false);
    }
    Event.emit(CPUModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});
    Event.emit(ModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});

    const result: any = this.getResult(urlWrapper);
    Event.emit(CPUModuleEvents.onResult, {module: this, url: urlWrapper, result: result});
    Event.emit(CPUModuleEvents.afterAnalyse, {module: this, url: urlWrapper, result: result});
    Event.emit(ModuleEvents.afterAnalyse, {module: this, url: urlWrapper});

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

    this.interval = setInterval(() => {
      const usage: any = {
        time: (new Date().getTime() - firstTime) / 1000,
        step: this.currentStep,
        context: this.currentContext,
      };

      os.cpuUsage((value: any) => {
        const cpu = value * 100;
        usage.cpu = cpu;
      });

      this.stock.push(usage);
    }, 100);
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
    this.stock.forEach((item: any) => {

      this.config?.storage?.add('cpu_history', this.context, {
        ...item,
        ...{
          url: urlWrapper.url,
        },
      });
    });

    // Average.
    const averageData = {
      ...this.getAverageData(),
      ...{
        url: urlWrapper.url,
      },
    };
    this.config?.storage?.add('cpu', this.context, averageData);
    this.config?.logger.result('CPU', averageData, urlWrapper.url.toString());
    return averageData;
  }

  /**
   * Return average data.
   *
   * @returns {{cpu: number, time: any}}
   * @private
   */
  private getAverageData() {
    return {
      time: this.stock.at(-1).time,
      cpu: this.stock.reduce((sum: number, currentValue: any) => {
        if (currentValue?.cpu) {
          return sum + currentValue.cpu;
        }
        return sum;
      }, 0) / this.stock.length,
    };
  }
}
