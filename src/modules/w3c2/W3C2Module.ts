import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {AbstractPuppeteerJourneyModule} from '../../journey/AbstractPuppeteerJourneyModule';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '../../journey/AbstractPuppeteerJourney';

export class W3C2Module extends AbstractPuppeteerJourneyModule {

  get name(): string {
    return 'W3C 2';
  }

  get id(): string {
    return `w3c2`;
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
  initEvents(journey: AbstractPuppeteerJourney) {
    journey.on(PuppeteerJourneyEvents.JOURNEY_CLOSE, async (data: any) => {
    });
  }

}
