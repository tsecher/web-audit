import { AbstractPuppeteerJourneyModule } from '../../journey/AbstractPuppeteerJourneyModule';
import { PuppeteerJourneyEvents } from '../../journey/AbstractPuppeteerJourney';
import { ModuleEvents } from '../ModuleInterface';
/**
 * W3c Validator Module events.
 */
export const AssetsCoverageModuleEvents = {
    createAssetsCoverageModule: 'assets_coverage_module__createAssetsCoverageModule',
    beforeAnalyse: 'assets_coverage_module__beforeAnalyse',
    onResult: 'assets_coverage_module__onResult',
    onResultDetail: 'assets_coverage_module__onResultDetail',
    afterAnalyse: 'assets_coverage_module__afterAnalyse',
};
/**
 * W3c Validator.
 */
export class AssetsCoverageModule extends AbstractPuppeteerJourneyModule {
    get name() {
        return 'Assets Coverage';
    }
    get id() {
        return `assets_coverage`;
    }
    defaultOptions = {};
    contexts = {};
    /**
     * {@inheritdoc}
     */
    async init(context) {
        this.context = context;
        // Install assets coverage store.
        this.context.config.storage?.installStore('assets_coverage', this.context, {
            url: 'Url',
            context: 'Context',
            js: 'Unused JS rate',
            css: 'Unused CSS rate',
            files: 'Unused files',
            total: 'Total unused assets rate',
        });
        // Install assets coverage store.
        this.context.config.storage?.installStore('assets_coverage_detail', this.context, {
            url: 'Url',
            context: 'Context',
            file: 'File',
            total: 'Total',
            used: 'Used',
        });
        // Emit.
        this.context.eventBus.emit(AssetsCoverageModuleEvents.createAssetsCoverageModule, { module: this });
    }
    /**
     * {@inheritdoc}
     */
    async analyse(urlWrapper) {
        this.context?.eventBus.emit(ModuleEvents.startsComputing, { module: this });
        for (const contextName in this.contexts) {
            if (contextName) {
                this.analyseContext(contextName, urlWrapper);
            }
        }
        this.context?.eventBus.emit(ModuleEvents.endsComputing, { module: this });
        return true;
    }
    /**
     * Analyse a context.
     *
     * @param {string} contextName
     * @param {UrlWrapper} urlWrapper
     */
    analyseContext(contextName, urlWrapper) {
        const eventData = {
            module: this,
            url: urlWrapper,
        };
        this.context?.eventBus.emit(AssetsCoverageModuleEvents.beforeAnalyse, eventData);
        this.context?.eventBus.emit(ModuleEvents.beforeAnalyse, eventData);
        const results = {
            js: {
                total: 0,
                used: 0,
                unusedRatio: 0,
                files: 0,
            },
            css: {
                total: 0,
                used: 0,
                unusedRatio: 0,
                files: 0,
            },
            all: {
                total: 0,
                used: 0,
                unusedRatio: 0,
            },
        };
        // const totalBytes: any = {js: 0, css: 0};
        // const usedBytes: any = {js: 0, css: 0};
        // const unusedFilesCount: any = {js: 0, css: 0};
        Object.keys(results).forEach((type) => {
            if (!this.contexts[contextName][type]) {
                return;
            }
            for (const entry of this.contexts[contextName][type]) {
                results[type].total += entry.text.length;
                results.all.total += results[type].total;
                let used = 0;
                for (const range of entry.ranges) {
                    used += range.end - range.start - 1;
                }
                results[type].used += used;
                results.all.used += results[type].used;
                if (results[type].used === 0) {
                    results[type].files++;
                }
                eventData.result = {
                    url: urlWrapper.url.toString(),
                    context: contextName,
                    file: entry.url,
                    total: entry.text.length,
                    used: used,
                };
                this.context?.eventBus.emit(AssetsCoverageModuleEvents.onResultDetail, eventData.result);
                this.context?.config.storage.add('assets_coverage_detail', this.context, eventData.result);
            }
        });
        // Compute ratio.
        Object.values(results).forEach((result) => {
            result.unusedRatio = result.used / result.total;
        });
        // Summary.
        eventData.result = {
            url: urlWrapper.url.toString(),
            context: contextName,
            js: 1 - results.js.unusedRatio,
            css: 1 - results.css.unusedRatio,
            files: results.js.files + results.css.files,
            total: 1 - results.all.unusedRatio,
        };
        this.context?.eventBus.emit(AssetsCoverageModuleEvents.onResult, eventData);
        this.context?.config?.logger.result(`Assets coverage`, eventData.result, urlWrapper.url.toString());
        this.context?.config?.storage?.add('assets_coverage', this.context, eventData.result);
        this.context?.eventBus.emit(ModuleEvents.afterAnalyse, eventData);
        this.context?.eventBus.emit(AssetsCoverageModuleEvents.afterAnalyse, eventData);
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data) => {
            await Promise.all([
                data.wrapper.page.coverage.startJSCoverage(),
                data.wrapper.page.coverage.startCSSCoverage(),
            ]);
        });
        journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data) => {
            const [jsCoverage, cssCoverage] = await Promise.all([
                data.wrapper.page.coverage.stopJSCoverage(),
                data.wrapper.page.coverage.stopCSSCoverage(),
            ]);
            this.contexts[data.name] = {
                js: jsCoverage,
                css: cssCoverage,
            };
        });
    }
}
