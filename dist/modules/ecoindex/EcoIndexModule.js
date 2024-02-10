import { EcoIndexStory } from 'ecoindex_puppeteer';
import { AbstractPuppeteerJourneyModule } from '../../journey/AbstractPuppeteerJourneyModule';
import { PuppeteerJourneyEvents } from '../../journey/AbstractPuppeteerJourney';
import { ModuleEvents } from '../ModuleInterface';
const ecoindex = require('ecoindex');
export const EcoIndexModuleEvents = {
    createEcoIndexModule: 'ecoindex_module__createEcoIndexModule',
    beforeAnalyse: 'ecoindex_module__beforeAnalyse',
    onResult: 'ecoindex_module__onResult',
    onBrowserClose: 'ecoindex_module__onBrowserClose',
    onBrowserLaunch: 'ecoindex_module__onBrowserLaunch',
    onNewPage: 'ecoindex_module__onNewPage',
    afterAnalyse: 'ecoindex_module__afterAnalyse',
};
export class EcoIndexModule extends AbstractPuppeteerJourneyModule {
    // @ts-ignore
    story;
    hasValue = false;
    get name() {
        return 'Eco Index';
    }
    get id() {
        return `ecoindex`;
    }
    defaultOptions = {
        bestPracticesAnalyse: true,
    };
    /**
     * {@inheritdoc}
     */
    async init(context) {
        this.context = context;
        // Install eco index store.
        this.context?.config.storage?.installStore('ecoindex', this.context, {
            url: 'Url',
            context: 'Context',
            grade: 'Grade',
            ecoIndex: 'Ecoindex',
            domSize: 'Dom Size',
            nbRequest: 'NB request',
            responsesSize: 'Responses Size',
            responsesSizeUncompress: 'Responses Size Uncompress',
            waterConsumption: 'Water consumption',
            greenhouseGasesEmission: 'Greenhouse Gases Emission',
            nbBestPracticesToCorrect: 'Nb Best practices to correct',
        });
        // Emit.
        this.context?.eventBus.emit(EcoIndexModuleEvents.createEcoIndexModule, { module: this });
    }
    /**
     * {@inheritdoc}
     */
    async analyse(urlWrapper) {
        if (!this.hasValue) {
            return Promise.resolve(false);
        }
        this.context?.eventBus.emit(EcoIndexModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        this.context?.eventBus.emit(ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        this.context?.eventBus.emit(ModuleEvents.startsComputing, { module: this });
        const results = this.getCleanResults(urlWrapper);
        results.forEach((result, index) => {
            result.context = this.journeyContexts[index].name;
            this.context?.config?.storage?.add('ecoindex', this.context, result);
            this.context?.config?.logger.result(`Ecoindex`, result, urlWrapper.url.toString());
        });
        this.context?.eventBus.emit(ModuleEvents.endsComputing, { module: this });
        this.context?.eventBus.emit(EcoIndexModuleEvents.onResult, { module: this, url: urlWrapper, result: results });
        this.context?.eventBus.emit(ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: results });
        return results.length > 0;
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        this.story = new EcoIndexStory();
        // Init ecoindex data.
        journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data) => this.story?.start(data.wrapper.page));
        journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data) => this.story?.addStep(data.step));
        journey.on(PuppeteerJourneyEvents.JOURNEY_END, async () => {
            this.hasValue = true;
            this.story?.stop(PuppeteerJourneyEvents.JOURNEY_END, false);
        });
        journey.on(PuppeteerJourneyEvents.JOURNEY_ERROR, async () => {
            this.hasValue = false;
            this.story?.stop(PuppeteerJourneyEvents.JOURNEY_ERROR, false);
        });
    }
    /**
     * Return clean results.
     *
     * @param {UrlWrapper} urlWrapper
     * @returns {any[]}
     * @private
     */
    getCleanResults(urlWrapper) {
        const allValidSteps = this.story?.getSteps()
            .filter((step) => step.getMetrics()?.hasData()) || [];
        // @ts-ignore
        return allValidSteps.map((step) => {
            const metrics = step.getMetrics();
            const ecoindexValue = ecoindex.computeEcoIndex(metrics?.getDomElementsCount(), metrics?.getRequestsCount(), metrics?.getSize() || 0);
            return {
                url: urlWrapper.url,
                grade: ecoindex.getEcoIndexGrade(ecoindexValue),
                ecoIndex: ecoindexValue,
                domSize: metrics?.getDomElementsCount(),
                nbRequest: metrics?.getRequestsCount(),
                responsesSize: metrics?.getSize(),
                greenhouseGasesEmission: ecoindex.computeGreenhouseGasesEmissionfromEcoIndex(ecoindexValue),
                waterConsumption: ecoindex.computeWaterConsumptionfromEcoIndex(ecoindexValue),
            };
        });
    }
}
