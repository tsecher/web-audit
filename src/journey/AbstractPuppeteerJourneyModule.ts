import {ModuleInterface} from '../modules/ModuleInterface';
import {UrlWrapper} from '../core/UrlWrapper';
import {WebAuditConfigClass} from '../core/WebAuditConfig';
import {WebAuditContextClass} from '../core/WebAuditContext';

import {AbstractJourneyModuleInterface} from './AbstractJourneyModuleInterface';
import {AbstractPuppeteerJourney} from './AbstractPuppeteerJourney';

export abstract class AbstractPuppeteerJourneyModule implements ModuleInterface, AbstractJourneyModuleInterface {

  abstract get id(): string;

  abstract get name(): string;

  abstract init(config: WebAuditConfigClass, context: WebAuditContextClass): void;

  abstract initEvents(journey: AbstractPuppeteerJourney): void;

  analyse(url: UrlWrapper): void {
  }

  finish(): void {
  }

  initJourney(journey: AbstractPuppeteerJourney): AbstractJourneyModuleInterface {
    this.initEvents(journey);

    return this;
  }

}
