import {ModuleEvents, ModuleInterface} from '../ModuleInterface';
import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';
import {UrlWrapper} from '../../core/UrlWrapper';

const validator = require('html-validator');


export const W3cValidatorModuleEvents: any = {
  createW3cValidatorModule: 'w3c_validator_module__createW3cValidatorModule',
  beforeAnalyse: 'w3c_validator_module__beforeAnalyse',
  onResult: 'w3c_validator_module__onResult',
  afterAnalyse: 'w3c_validator_module__afterAnalyse',
};

export class W3cValidatorModule implements ModuleInterface {

  get name(): string {
    return 'W3C validator';
  }

  get id(): string {
    return `w3c_validator`;
  }

  private options: any;

  private config?: Config;

  private context?: Context;

  private defaultOptions = {
    allowedTypes: ['error', 'warning'],
  };

  constructor(
    userOptions: any = {},
  ) {
    // Build dependencies.
    this.options = {
      ...this.defaultOptions,
      ...userOptions,
    };
  }

  /**
   * {@inheritdoc}
   */
  async init(config: Config, context: Context): Promise<any> {
    this.config = config;
    this.context = context;

    // Install lighthouse store.
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
  async analyse(urlWrapper: UrlWrapper): Promise<any> {
    Event.emit(W3cValidatorModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});
    Event.emit(ModuleEvents.beforeAnalyse, {module: this, url: urlWrapper});

    const options = {
      url: urlWrapper.url.toString(),
      data: await this.fetchHtml(urlWrapper.url),
    };

    try {
      const result: any = await validator(options);
      Event.emit(W3cValidatorModuleEvents.onResult, {module: this, url: urlWrapper, result: result});
      Event.emit(ModuleEvents.onAnalyseResult, {module: this, url: urlWrapper, result: result});

      this.options.allowedTypes.forEach((type: string) => {
        const count = result.messages.filter((item: any) => item.type === type);
        if (count.length) {
          this.config?.logger.warning(`[W3C] ${count.length} ${type} found.`);
        }
      });

      result.messages
        .filter((item: any) => this.options.allowedTypes.includes(item.type))
        .forEach((item: any) => {
          item.url = urlWrapper.url.toString();
          this.config?.storage?.add('w3c_validator', this.context, item);
        });

      return true;
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Fetch html
   * @param {URL} url
   */
  async fetchHtml(url: URL) {
    try {
      const response: Response = await fetch(url.toString());
      const body: string = await response.text();
      return body;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Finish analyse process.
   *
   * @returns {Promise<any>}
   */
  async finish(): Promise<any> {
  }


}

