import { AbstractPuppeteerJourney } from '##/journey/AbstractPuppeteerJourney';
/**
 * Default journey.
 *
 *  1. Go to URL
 *  2. Wait load
 *  3. Scroll to bottom
 *  4. Wait load
 */
export default class ScrollToBottomJourney extends AbstractPuppeteerJourney {
    /**
     * {@inheritdoc}
     */
    get id() {
        return 'scroll_to_bottom_journey';
    }
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'Scroll to bottom journey';
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
