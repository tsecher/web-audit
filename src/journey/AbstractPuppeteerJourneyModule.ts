import {ModuleInterface} from '../modules/ModuleInterface';
import {UrlWrapper} from '../core/UrlWrapper';
import {WebAuditConfigClass as Config, WebAuditConfigClass} from '../core/WebAuditConfig';
import {WebAuditContextClass as Context, WebAuditContextClass} from '../core/WebAuditContext';

import {AbstractJourneyModuleInterface} from './AbstractJourneyModuleInterface';
import {JourneyInterface} from './JourneyInterface';

export abstract class AbstractPuppeteerJourneyModule implements ModuleInterface, AbstractJourneyModuleInterface {

  abstract get id(): string;

  abstract get name(): string;

  abstract init(config: WebAuditConfigClass, context: WebAuditContextClass): void;

  abstract initEvents(journey: JourneyInterface): void;

  protected defaultOptions?: any;

  protected config?: Config;

  protected context?: Context;

  getOptions(inputOptions: any = {}): any {
    return {
      ...this.defaultOptions,
      ...inputOptions,
    };
  }

  analyse(url: UrlWrapper): Promise<boolean> {
    return Promise.resolve(true);
  }

  finish(): void {
  }

  initJourney(journey: JourneyInterface): AbstractJourneyModuleInterface {
    this.initEvents(journey);

    return this;
  }

}
