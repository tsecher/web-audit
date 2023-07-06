import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {AbstractPuppeteerJourneyModule} from '../../journey/AbstractPuppeteerJourneyModule';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '../../journey/AbstractPuppeteerJourney';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';
import {PageWrapper} from '../../journey/PageWrapper';
import {ModuleEvents} from '../ModuleInterface';
import {UrlWrapper} from '../../core/UrlWrapper';

const validator = require('html-validator');


/**
 * W3c Validator Module events.
 */
export const W3cValidatorModuleEvents: any = {
  createW3cValidatorModule: 'w3c_validator_module__createW3cValidatorModule',
  beforeAnalyse: 'w3c_validator_module__beforeAnalyse',
  onResult: 'w3c_validator_module__onResult',
  afterAnalyse: 'w3c_validator_module__afterAnalyse',
};

/**
 * W3c Validator.
 */
export class W3cValidatorModule extends AbstractPuppeteerJourneyModule {

  get name(): string {
    return 'W3C';
  }

  get id(): string {
    return `w3c`;
  }

  protected defaultOptions?: any = {
    allowedTypes: ['error', 'warning'],
  };

  private dom?: string | null;

  /**
   * {@inheritdoc}
   */
  async init(config: Config, context: Context): Promise<any> {
    this.config = config;
    this.context = context;

    // Install w3c store.
    this.config.storage?.installStore('w3c_validator', this.context, {
      url: 'Url',
      type: 'Type',
      message: 'Message',
      extract: 'Extract',
    });

    // Emit.
    Event.emit(W3cValidatorModuleEvents.createW3cValidatorModule, {module: this});
  }

  /**
   * {@inheritdoc}
   */
  async analyse(urlWrapper: UrlWrapper): Promise<boolean> {
    Event.emit(W3cValidatorModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});
    Event.emit(ModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});


    let success: boolean;
    const options = this.getOptions();

    if (this.dom) {
      try {
        const result: any = await validator({
          url: urlWrapper.url.toString(),
          data: this.dom,
        });

        Event.emit(W3cValidatorModuleEvents.onResult, {module: this, url: urlWrapper, result: result});
        Event.emit(ModuleEvents.onAnalyseResult, {module: this, url: urlWrapper, result: result});

        const summary: any = {};
        options.allowedTypes.forEach((type: string) => {
          summary[type] = result.messages.filter((item: any) => item.type === type).length;
        });
        this.config?.logger.result(`W3C`, summary, urlWrapper.url.toString());

        result.messages
          .filter((item: any) => options.allowedTypes.includes(item.type))
          .forEach((item: any) => {
            item.url = urlWrapper.url.toString();
            this.config?.storage?.add('w3c_validator', this.context, item);
          });

        success = true;
      } catch (error) {
        success = false;
      }
    } else {
      success = false;
    }

    return success;
  }

  /**
   * Finish analyse process.
   *
   * @returns {Promise<any>}
   */
  async finish(): Promise<any> {
    this.dom = null;
  }

  /**
   * {@inheritdoc}
   */
  initEvents(journey: AbstractPuppeteerJourney) {
    journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data: any) => {
      this.dom = null;
    });

    journey.on(PuppeteerJourneyEvents.JOURNEY_END, async (data: any) => {
      const wrapper: PageWrapper = data.wrapper;

      this.dom = await wrapper.page.content();
    });
  }

}
