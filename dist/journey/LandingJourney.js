import { AbstractPuppeteerJourney } from '##/journey/AbstractPuppeteerJourney';
/**
 * Default journey.
 *
 *  1. Go to URL
 */
export default class LandingJourney extends AbstractPuppeteerJourney {
    /**
     * {@inheritdoc}
     */
    get id() {
        return 'landing_journey';
    }
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'Landing journey';
    }
    /**
     * {@inheritdoc}
     */
    async init(wrapper) {
        return Promise.resolve();
    }
    /**
     * {@inheritdoc}
     */
    async journey(wrapper, url) {
        await this.triggerNewContext('Visit');
        await this.addStep(`Go to ${url.url.toString()}`, async () => {
            await wrapper.goto(url.url.toString());
        });
        await this.triggerEndContext();
    }
}
