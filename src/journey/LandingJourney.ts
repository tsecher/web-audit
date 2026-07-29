import {UrlWrapper} from '##/core/UrlWrapper';
import {AbstractPuppeteerJourney} from '##/journey/AbstractPuppeteerJourney';
import {PageWrapper} from '##/journey/PageWrapper';

/**
 * Default journey.
 *
 *  1. Go to URL
 */
export default class LandingJourney extends AbstractPuppeteerJourney {

    /**
     * {@inheritdoc}
     */
    get id(): string {
        return 'landing_journey';
    }

    /**
     * {@inheritdoc}
     */
    get name(): string {
        return 'Landing journey';
    }

    /**
     * {@inheritdoc}
     */
    async init(wrapper: PageWrapper): Promise<void> {
        return Promise.resolve();
    }

    /**
     * {@inheritdoc}
     */
    async journey(wrapper: PageWrapper, url: UrlWrapper): Promise<void> {
        await this.triggerNewContext('Visit');
        await this.addStep(`Go to ${url.url.toString()}`, async () => {
            await wrapper.goto(url.url.toString());
        });

        await this.triggerEndContext();
    }

}
