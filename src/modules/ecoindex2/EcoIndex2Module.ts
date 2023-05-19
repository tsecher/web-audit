import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';
import {AbstractPuppeteerJourneyModule} from '../../journey/AbstractPuppeteerJourneyModule';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '../../journey/AbstractPuppeteerJourney';

export const EcoIndex2ModuleEvents: any = {
  createEcoIndexModule: 'ecoindex_module__createEcoIndexModule',
  beforeAnalyse: 'ecoindex_module__beforeAnalyse',
  onResult: 'ecoindex_module__onResult',
  onBrowserClose: 'ecoindex_module__onBrowserClose',
  onBrowserLaunch: 'ecoindex_module__onBrowserLaunch',
  onNewPage: 'ecoindex_module__onNewPage',
  afterAnalyse: 'ecoindex_module__afterAnalyse',
};

export class EcoIndex2Module extends AbstractPuppeteerJourneyModule {

  get name(): string {
    return 'Eco Index 2';
  }

  get id(): string {
    return `ecoindex2`;
  }

  private config?: Config;

  private context?: Context;

  private defaultOptions = {
    bestPracticesAnalyse: true,
  };

  /**
   * {@inheritdoc}
   */
  async init(config: Config, context: Context): Promise<any> {
    this.config = config;
    this.context = context;

    // Install eco index store.
    this.config.storage?.installStore('ecoindex2', this.context, {
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
    Event.emit(EcoIndex2ModuleEvents.createEcoIndexModule, {module: this});
  }

  /**
   * Finish analyse process.
   *
   * @returns {Promise<any>}
   */
  async finish(): Promise<any> {
  }

  /**
   * {@inheritdoc}
   */
  initEvents(journey: AbstractPuppeteerJourney): void {
    journey.on(PuppeteerJourneyEvents.JOURNEY_AFTER_STEP, async (data: any) => {
    });
  }

}
