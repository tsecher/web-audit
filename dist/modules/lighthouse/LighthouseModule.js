// import lighthouse from 'lighthouse';
import { AbstractPuppeteerJourneyModule } from '../../journey/AbstractPuppeteerJourneyModule';
import { PuppeteerJourneyEvents } from '../../journey/AbstractPuppeteerJourney';
import { ModuleEvents } from '../ModuleInterface';
/**
 * Lighthouse Module events.
 */
export const LighthouseModuleEvents = {
    createLighthouseModule: 'lighthouse_module__createLighthouseModule',
    beforeAnalyse: 'lighthouse_module__beforeAnalyse',
    onResult: 'lighthouse_module__onResult',
    onBrowserClose: 'lighthouse_module__onBrowserClose',
    onBrowserLaunch: 'lighthouse_module__onBrowserLaunch',
    onNewPage: 'lighthouse_module__onNewPage',
    afterAnalyse: 'lighthouse_module__afterAnalyse',
};
/**
 * W3c Validator.
 */
export class LighthouseModule extends AbstractPuppeteerJourneyModule {
    reports = [];
    defaultOptions = {
        output: 'json',
        onlyCategories: ['performance', 'seo', 'best-practices', 'accessibility'],
    };
    get name() {
        return 'Google Lighthouse';
    }
    get id() {
        return `lighthouse`;
    }
    /**
     * {@inheritdoc}
     */
    async init(context) {
        this.context = context;
        // Install lighthouse store.
        this.context?.config.storage?.installStore('lighthouse', this.context, {
            url: 'Url',
            context: 'Context',
            performance: 'Performance',
            seo: 'SEO',
            'best-practices': 'Best Practices',
            accessibility: 'Accessibility',
        });
        // Emit.
        this.context?.eventBus.emit(LighthouseModuleEvents.createLighthouseModule, { module: this });
    }
    /**
     * {@inheritdoc}
     */
    async analyse(urlWrapper) {
        this.context?.eventBus.emit(ModuleEvents.startsComputing, { module: this });
        this.reports.forEach((contextReport, index) => {
            if (!contextReport) {
                return;
            }
            // Report
            const report = {};
            report.context = this.journeyContexts[index].name;
            this.getOptions()
                ?.onlyCategories
                ?.map((cat) => {
                try {
                    report[cat] = contextReport.report.categories[cat].score;
                }
                catch (error) {
                    this.context?.config?.logger.error(error);
                }
            });
            const eventData = {
                module: this,
                url: urlWrapper,
                result: contextReport,
            };
            this.context?.eventBus.emit(LighthouseModuleEvents.onResult, eventData);
            this.context?.eventBus.emit(ModuleEvents.onAnalyseResult, eventData);
            if (report?.performance) {
                this.context?.config?.logger.result(`Lighthouse`, report, urlWrapper.url.toString());
            }
            else {
                this.context?.config?.logger.error(`Could not analyse page`);
                this.context?.config?.logger.error(report);
            }
            report.url = urlWrapper.url.toString();
            this.context?.config?.storage?.add('lighthouse', this.context, report);
            this.context?.eventBus.emit(LighthouseModuleEvents.afterAnalyse, eventData);
            this.context?.eventBus.emit(ModuleEvents.afterAnalyse, eventData);
        });
        this.context?.eventBus.emit(ModuleEvents.endsComputing, { module: this });
        return true;
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data) => {
            this.reports = [];
        });
        journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data) => this.launchLighthouse(data.wrapper));
    }
    /**
     * Laucnh lighthouse.
     *
     * @param {PageWrapper} wrapper
     *   Page wrapper.
     *
     * @returns {Promise<undefined>}
     *
     * @private
     */
    async launchLighthouse(wrapper) {
        this.context?.eventBus.emit(ModuleEvents.startsComputing, { module: this });
        const browser = await wrapper.getBrowser();
        const endpoint = new URL(browser.wsEndpoint());
        const options = this.getOptions();
        options.port = endpoint.port;
        // const result = await lighthouse(
        //   wrapper.page.url(),
        //   options,
        //   {extends: 'lighthouse:default'},
        // );
        //
        // this.reports.push({
        //   report: result?.lhr,
        //   html: result?.report,
        // });
        this.context?.eventBus.emit(ModuleEvents.endsComputing, { module: this });
    }
}
