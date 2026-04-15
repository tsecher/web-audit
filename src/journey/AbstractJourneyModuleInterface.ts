import {AbstractPuppeteerJourney} from '##/journey/AbstractPuppeteerJourney';

export interface AbstractJourneyModuleInterface {
    initJourney(journey: AbstractPuppeteerJourney): AbstractJourneyModuleInterface;
}
