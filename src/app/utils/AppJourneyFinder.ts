import fs from 'fs';
import path from 'path';

import {AppConfig} from '../conf/AppConfig';
import {JourneyInterface} from '../../journey/JourneyInterface';
import {DefaultPuppeteerJourney} from '../../journey/DefaultPuppeteerJourney';

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
  public getJourneys(force = false): JourneyInterface[] {
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
  protected getEmbedJourneys(): JourneyInterface[] {
    return [
      new DefaultPuppeteerJourney(),
    ];
  }

  /**
   * Init journeys.
   *
   * @protected
   */
  protected initJourneys() {

    const journeys: any = {};
    this.getEmbedJourneys()
      .concat(this.getJourneysFromConfig())
      .map((journey: JourneyInterface) => {
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
  protected getJourneysFromConfig(): JourneyInterface[] {
    const journeyDataList = AppConfig.getConfig()?.journeys;
    const journeysList: JourneyInterface[] = [];
    if (journeyDataList && journeyDataList.length) {
      for (const journeyData of journeyDataList) {
        const journeyPath = path.resolve(process.cwd(), journeyData.path);
        if (fs.existsSync(journeyPath)) {
          const JourneyClass = require(journeyPath)[journeyData.id];
          journeysList.push(new JourneyClass());
        }
      }

    }
    return journeysList;
  }
}

export const JourneyFinder = new JourneyFinderClass();
