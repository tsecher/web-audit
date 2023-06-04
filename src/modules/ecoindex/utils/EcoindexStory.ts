/**
 * Ecoindex story wrapper.
 */
import {isSet} from 'util/types';

import {AbstractEventsClass} from '../../../journey/AbstractEventsClass';

import {ECOINDEX_HANDLER_OPTIONS, EcoindexDataHandler, EcoindexStructure} from './EcoindexDataHandler';

/**
 * Events.
 *
 * @type {{AFTER_INIT: string, PAGE_LOADED: string, AFTER_SCROLL: string, AFTER_VISIT: string}}
 */
export const ECOINDEX_STORY_EVENTS = {
  AFTER_INIT: 'Ecoindex Story - After initialization',
  BEFORE_ADD_STEP: 'Ecoindex Story - Before add step',
  AFTER_ADD_STEP: 'Ecoindex Story - After add step',
};

/**
 * Step structure.
 */
class EcoindexStoryStep {

  public date: Date;

  constructor(
    public name: string,
    public ecoindex: EcoindexStructure | undefined,
  ) {
    this.date = new Date();
  }

  hasData(): boolean {
    return this.ecoindex?.hasData() || false;
  }
}

/**
 * Get the ecoindex raw data for a user story.
 */
export class EcoindexStory extends AbstractEventsClass {

  protected steps: EcoindexStoryStep[] = [];
  protected handler: EcoindexDataHandler | undefined;
  protected eventData: any;

  /**
   * Return current step.
   */
  getCurrentStep(): EcoindexStoryStep | null {
    return this.steps.length > 0 ? this.steps[this.steps.length - 1] : null;
  }

  /**
   * Initialize and start a story.
   *
   * @returns {Promise<void>}
   */
  async start(page: any, conf = {}): Promise<void> {
    const options = {...ECOINDEX_HANDLER_OPTIONS, ...conf};
    this.handler = new EcoindexDataHandler(page, options);
    this.eventData = {page: page, options: options, handler: this.handler};

    await this.handler.init();
    await this.trigger(ECOINDEX_STORY_EVENTS.AFTER_INIT, this.eventData);

    this.steps = [];
  }

  /**
   * Add a new step in the story.
   */
  async addStep(name: string): Promise<void> {
    await this.trigger(ECOINDEX_STORY_EVENTS.BEFORE_ADD_STEP, this.eventData);
    const ecoindex = await this.handler?.getRawResult();
    const step = new EcoindexStoryStep(name, ecoindex);
    this.steps.push(step);
    this.handler?.clearResults();
    await this.trigger(ECOINDEX_STORY_EVENTS.AFTER_ADD_STEP, {...this.eventData, ...{step: step}});
  }

  /**
   * Stop story logs.
   *
   * @returns {Promise<void>}
   */
  async end(name: string): Promise<void> {
    await this.addStep(name);
    return this.handler?.stop();
  }

  /**
   * Return data.
   *
   * @returns {EcoindexStoryStep[]}
   */
  getData(): EcoindexStoryStep[] {
    return this.steps;
  }
}


