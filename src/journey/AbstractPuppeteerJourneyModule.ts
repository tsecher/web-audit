import {ModuleInterface} from '../modules/ModuleInterface';
import {UrlWrapper} from '../core/UrlWrapper';
import {WebAuditContextClass} from '../core/WebAuditContext';

import {AbstractJourneyModuleInterface} from './AbstractJourneyModuleInterface';
import {JourneyInterface} from './JourneyInterface';

export abstract class AbstractPuppeteerJourneyModule implements ModuleInterface, AbstractJourneyModuleInterface {

  abstract get id(): string;

  abstract get name(): string;

  abstract init(context: WebAuditContextClass): void;

  abstract initEvents(journey: JourneyInterface): void;

  protected defaultOptions?: any;

  protected context?: WebAuditContextClass;

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
