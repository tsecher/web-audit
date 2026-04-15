import fs from 'fs';
import path from 'path';
import { AppConfig } from '##/app/conf/AppConfig';
import ScrollToBottomJourney from '##/journey/ScrollToBottomJourney';
/**
 * Find journey according to configuration file.
 */
class JourneyFinderClass {
    journeys;
    /**
     * Return the list of available journeys.
     *
     * @returns {JourneyInterface[]}
     */
    async getJourneys(force = false) {
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
    getEmbedJourneys() {
        return [
            new ScrollToBottomJourney(),
        ];
    }
    /**
     * Init journeys.
     *
     * @protected
     */
    async initJourneys() {
        const journeys = {};
        const defaultJourney = new ScrollToBottomJourney();
        journeys[defaultJourney.id] = defaultJourney;
        (await this.getJourneysFromConfig())
            .map((journey) => {
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
    async getJourneysFromConfig() {
        const journeyDataList = AppConfig.getConfig()?.journeys;
        const journeysList = [];
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
