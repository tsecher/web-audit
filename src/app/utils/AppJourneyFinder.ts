import fs from 'fs';
import path from 'path';

import {AppConfig} from '##/app/conf/AppConfig';
import {JourneyInterface} from '##/journey/JourneyInterface';
import ScrollToBottomJourney from '##/journey/ScrollToBottomJourney';
import {WebAuditCrawler} from '##/crawlers/Crawler';

/**
 * Find journey according to configuration file.
 */
class JourneyFinderClass {

    protected journeys?: JourneyInterface[];

    /**
     * Return the list of available journeys.
     *
     * @returns {JourneyInterface[]}
     */
    public async getJourneys(force = false): Promise<JourneyInterface[]> {
        if (force || !this.journeys) {
            await this.initJourneys();
        }

        return this.journeys || [];
    }

    /**
     * Return all embed journeys.
     *
     * @returns {JourneyInterface[]}
     * @protected
     */
    protected getEmbedJourneys(): JourneyInterface[] {
        return [
            new ScrollToBottomJourney(),
        ];
    }

    /**
     * Init journeys.
     *
     * @protected
     */
    protected async initJourneys() {
        const journeys: any = {};

        const defaultJourney = new ScrollToBottomJourney();
        journeys[defaultJourney.id] = defaultJourney;

        (await this.getJourneysFromConfig())
            .map((journey: any) => {
                journeys[journey.id] = journey;
            });

        this.journeys = Object.values(journeys);
    }

    /**
     * BUild the journey list from journey path.
     *
     * @param {string[]}
     * @returns {JourneyInterface[]}
     * @protected
     */
    protected async getJourneysFromConfig(): Promise<JourneyInterface[]> {
        const journeyDataList = AppConfig.getConfig()?.journeys;
        const journeysList: JourneyInterface[] = [];
        if (journeyDataList && journeyDataList.length) {
            for (const journeyData of journeyDataList) {
                const journeyPath = path.resolve(process.cwd(), journeyData);
                if (fs.existsSync(journeyPath)) {
                    const ModuleClass = (await import(journeyPath)).default;
                    journeysList.push(new ModuleClass());
                }
            }

        }
        return journeysList;
    }
}

export const JourneyFinder = new JourneyFinderClass();
