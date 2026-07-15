import DefaultPuppeteerJourney from 'web_audit/dist/journey/DefaultPuppeteerJourney.js';

/**
 * <%= readable_name; %>.
 */
export default class <%= CamelName; %>Journey extends DefaultPuppeteerJourney {

	/**
	 * {@inheritdoc}
	 */
	get name() {
		return '<%= readable_name; %>';
	}

	/**
	 * {@inheritdoc}
	 */
	get id() {
		return `<%= snake_name; %>`;
	}

	/**
	 * {@inheritdoc}
	 */
	async journey(wrapper, urlWrapper) {
		const wait = 1000;

		await this.triggerNewContext('Visit and scroll');

		await this.addStep(`Go to ${urlWrapper.url.toString()}`, async () => {
			await wrapper.goto(urlWrapper.url.toString());
		});

		await this.addStep(`Wait 1s`, async () => {
			await wrapper.wait(Number(wait));
		});

		await this.addStep('Scroll to bottom', async () => {
			await wrapper.scrollToBottom();
		});

		await this.addStep('Finally wait 3s', async () => {
			await wrapper.wait(3 * wait);
		});

		await this.triggerEndContext();
	}
}
