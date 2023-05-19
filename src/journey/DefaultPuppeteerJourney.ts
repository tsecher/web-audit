import {UrlWrapper} from '../core/UrlWrapper';

import {AbstractPuppeteerJourney} from './AbstractPuppeteerJourney';
import {PageWrapper} from './PageWrapper';

export class DefaultPuppeteerJourney extends AbstractPuppeteerJourney {

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

    await this.addStep('wait', async () => {
      await wrapper.wait(1000);
    });

    await this.addStep('goto', async () => {
      await wrapper.goto(url.url.toString());
    });

    await this.addStep('wait', async () => {
      await wrapper.wait(1000);
    });

    await this.addStep('scrollToBottom', async () => {
      await wrapper.scrollToBottom();
    });

    await this.addStep('finally wait', async () => {
      await wrapper.wait(3000);
    });
  }

}
