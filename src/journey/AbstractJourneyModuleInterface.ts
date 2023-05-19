import {AbstractPuppeteerJourney} from './AbstractPuppeteerJourney';

export interface AbstractJourneyModuleInterface {

  initJourney(journey: AbstractPuppeteerJourney): AbstractJourneyModuleInterface;
}
