"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyFinder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AppConfig_1 = require("../conf/AppConfig");
const DefaultPuppeteerJourney_1 = require("../../journey/DefaultPuppeteerJourney");
/**
 * Find journey according to configuration file.
 */
class JourneyFinderClass {
    /**
     * Return the list of available journeys.
     *
     * @returns {JourneyInterface[]}
     */
    getJourneys(force = false) {
        if (force || !this.journeys) {
            this.initJourneys();
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
            new DefaultPuppeteerJourney_1.DefaultPuppeteerJourney(),
        ];
    }
    /**
     * Init journeys.
     *
     * @protected
     */
    initJourneys() {
        const journeys = {};
        this.getEmbedJourneys()
            .concat(this.getJourneysFromConfig())
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
    getJourneysFromConfig() {
        var _a;
        const journeyDataList = (_a = AppConfig_1.AppConfig.getConfig()) === null || _a === void 0 ? void 0 : _a.journeys;
        const journeysList = [];
        if (journeyDataList && journeyDataList.length) {
            for (const journeyData of journeyDataList) {
                const journeyPath = path_1.default.resolve(process.cwd(), journeyData.path);
                if (fs_1.default.existsSync(journeyPath)) {
                    const JourneyClass = require(journeyPath)[journeyData.id];
                    journeysList.push(new JourneyClass());
                }
            }
        }
        return journeysList;
    }
}
exports.JourneyFinder = new JourneyFinderClass();
