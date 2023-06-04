import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';
import {AbstractPuppeteerJourneyModule} from '../../journey/AbstractPuppeteerJourneyModule';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '../../journey/AbstractPuppeteerJourney';
import {UrlWrapper} from '../../core/UrlWrapper';
import {ModuleEvents} from '../ModuleInterface';

import {EcoindexStory} from './utils/EcoindexStory';

const ecoindex = require('ecoindex');


export const EcoIndexModuleEvents: any = {
  createEcoIndexModule: 'ecoindex_module__createEcoIndexModule',
  beforeAnalyse: 'ecoindex_module__beforeAnalyse',
  onResult: 'ecoindex_module__onResult',
  onBrowserClose: 'ecoindex_module__onBrowserClose',
  onBrowserLaunch: 'ecoindex_module__onBrowserLaunch',
  onNewPage: 'ecoindex_module__onNewPage',
  afterAnalyse: 'ecoindex_module__afterAnalyse',
};

export class EcoIndexModule extends AbstractPuppeteerJourneyModule {

  protected story: EcoindexStory | undefined;

  get name(): string {
    return 'Eco Index';
  }

  get id(): string {
    return `ecoindex`;
  }

  protected defaultOptions = {
    bestPracticesAnalyse: true,
  };

  /**
   * {@inheritdoc}
   */
  async init(config: Config, context: Context): Promise<any> {
    this.config = config;
    this.context = context;

    // Install eco index store.
    this.config.storage?.installStore('ecoindex', this.context, {
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
    this.config.storage?.installStore('ecoindex_best_practices2', this.context, {
      url: 'Url',
      id: 'ID',
      comment: 'Message',
      complianceLevel: 'Compliance level',
      detailComment: 'Detail',
    });

    // Emit.
    Event.emit(EcoIndexModuleEvents.createEcoIndexModule, {module: this});
  }

  /**
   * {@inheritdoc}
   */
  async analyse(urlWrapper: UrlWrapper): Promise<boolean> {
    Event.emit(EcoIndexModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});
    Event.emit(ModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});

    const results: any[] = this.getCleanResults(urlWrapper);
    const logs: any = [];
    results.forEach((result) => {
      this.config?.storage?.add('ecoindex', this.context, result);
      this.config?.logger.result(`Ecoindex`, result, urlWrapper.url.toString());
    });

    Event.emit(EcoIndexModuleEvents.onResult, {module: this, url: urlWrapper, result: results});
    Event.emit(ModuleEvents.onAnalyseResult, {module: this, url: urlWrapper, result: results});

    return results.length > 0;
  }

  /**
   * {@inheritdoc}
   */
  initEvents(journey: AbstractPuppeteerJourney): void {
    this.story = new EcoindexStory();

    // Init ecoindex data.
    journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data: any) => this.story?.start(data.wrapper.page));
    journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data: any) => this.story?.addStep(data.step));
    journey.on(PuppeteerJourneyEvents.JOURNEY_END, async (data: any) => this.story?.end(PuppeteerJourneyEvents.JOURNEY_END));
  }

  /**
   * Return clean results.
   *
   * @param {UrlWrapper} urlWrapper
   * @returns {any[]}
   * @private
   */
  private getCleanResults(urlWrapper: UrlWrapper): any[] {
    const allValidSteps = this.story?.getData()
      .filter((step) => step.hasData()) || [];

    return allValidSteps.map((step) => {
      const ecoindexValue = ecoindex.computeEcoIndex(step.ecoindex?.dom, step.ecoindex?.request, (step.ecoindex?.size || 0) / 1000);

      return {
        url: urlWrapper.url,
        grade: ecoindex.getEcoIndexGrade(ecoindexValue),
        ecoIndex: ecoindexValue,
        domSize: step.ecoindex?.dom,
        nbRequest: step.ecoindex?.request,
        responsesSize: step.ecoindex?.size,
        waterConsumption: ecoindex.computeGreenhouseGasesEmissionfromEcoIndex(ecoindexValue),
        greenhouseGasesEmission: ecoindex.computeWaterConsumptionfromEcoIndex(ecoindexValue),
      };
    });

  }
}
