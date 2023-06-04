import {UrlWrapper} from '../core/UrlWrapper';

import {AbstractPuppeteerJourney} from './AbstractPuppeteerJourney';
import {PageWrapper} from './PageWrapper';

/**
 * Default journey.
 *
 *  1. Go to URL
 *  2. Wait load
 *  3. Scroll to bottom
 *  4. Wait load
 */
export class DefaultPuppeteerJourney extends AbstractPuppeteerJourney {

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

    await this.addStep('goto', async () => {
      await wrapper.goto(url.url.toString());
    });

    await this.addStep('wait', async () => {
      await wrapper.wait(Number(wait));
    });

    await this.addStep('scrollToBottom', async () => {
      await wrapper.scrollToBottom();
    });

    await this.addStep('finally wait', async () => {
      await wrapper.wait(3 * wait);
    });

    await this.triggerNewContext('finally wait');
  }

}
