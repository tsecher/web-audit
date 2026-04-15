import {UrlWrapper} from '##/core/UrlWrapper';
import {AbstractPuppeteerJourney} from '##/journey/AbstractPuppeteerJourney';
import {PageWrapper} from '##/journey/PageWrapper';

/**
 * Default journey.
 *
 *  1. Go to URL
 *  2. Wait load
 *  3. Scroll to bottom
 *  4. Wait load
 */
export default class DefaultPuppeteerJourney extends AbstractPuppeteerJourney {

    /**
     * {@inheritdoc}
     */
    get id(): string {
        return 'default_journey';
    }

    /**
     * {@inheritdoc}
     */
    get name(): string {
        return 'Default journey';
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
        const wait = 1000;

        await this.addStep(`Go to ${url.url.toString()}`, async () => {
            await wrapper.goto(url.url.toString());
        });

        await this.addStep(`Wait 3s`, async () => {
            await wrapper.wait(3 * Number(wait));
        });

        await this.addStep('Scroll to bottom', async () => {
            await wrapper.scrollToBottom();
        });

        await this.addStep('Finally wait 3s', async () => {
            await wrapper.wait(3 * wait);
        });

        await this.triggerNewContext('Visit and scroll');
    }

}
