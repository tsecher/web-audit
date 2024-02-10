import { AbstractPuppeteerJourneyModule } from '../../journey/AbstractPuppeteerJourneyModule';
import { PuppeteerJourneyEvents } from '../../journey/AbstractPuppeteerJourney';
import { ModuleEvents } from '../ModuleInterface';
const validator = require('html-validator');
/**
 * W3c Validator Module events.
 */
export const W3cValidatorModuleEvents = {
    createW3cValidatorModule: 'w3c_validator_module__createW3cValidatorModule',
    beforeAnalyse: 'w3c_validator_module__beforeAnalyse',
    onResult: 'w3c_validator_module__onResult',
    afterAnalyse: 'w3c_validator_module__afterAnalyse',
};
/**
 * W3c Validator.
 */
export class W3cValidatorModule extends AbstractPuppeteerJourneyModule {
    get name() {
        return 'W3C';
    }
    get id() {
        return `w3c`;
    }
    defaultOptions = {
        allowedTypes: ['error', 'warning'],
    };
    doms = [];
    /**
     * {@inheritdoc}
     */
    async init(context) {
        this.context = context;
        // Install w3c store.
        this.context.config.storage?.installStore('w3c', this.context, {
            url: 'Url',
            context: 'Context',
            error: 'Errors',
            warning: 'Warnings',
            info: 'Infos',
        });
        this.context.config.storage?.installStore('w3c_details', this.context, {
            url: 'Url',
            context: 'Context',
            type: 'Type',
            message: 'Message',
            extract: 'Extract',
        });
        // Emit.
        this.context.eventBus.emit(W3cValidatorModuleEvents.createW3cValidatorModule, { module: this });
    }
    /**
     * {@inheritdoc}
     */
    async analyse(urlWrapper) {
        this.context?.eventBus.emit(W3cValidatorModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        this.context?.eventBus.emit(ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
        let success = false;
        const options = this.getOptions();
        this.doms = this.doms || [];
        for (const index in this.doms) {
            if (this.doms[index]) {
                const dom = this.doms[index];
                try {
                    this.context?.eventBus.emit(ModuleEvents.startsComputing, { module: this });
                    const result = await validator({
                        url: urlWrapper.url.toString(),
                        data: dom,
                    });
                    this.context?.eventBus.emit(W3cValidatorModuleEvents.onResult, {
                        module: this,
                        url: urlWrapper,
                        result: result,
                    });
                    this.context?.eventBus.emit(ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: result });
                    const summary = { context: this.journeyContexts[index].name };
                    options.allowedTypes.forEach((type) => {
                        summary[type] = result.messages.filter((item) => item.type === type).length;
                    });
                    this.context?.config?.logger.result(`W3C`, summary, urlWrapper.url.toString());
                    summary.url = urlWrapper.url.toString();
                    this.context?.config?.storage?.add('w3c', this.context, summary);
                    result.messages
                        .filter((item) => options.allowedTypes.includes(item.type))
                        .forEach((item) => {
                        item.url = urlWrapper.url.toString();
                        item.context = this.journeyContexts[index].name;
                        this.context?.config?.storage?.add('w3c_details', this.context, item);
                    });
                    this.context?.eventBus.emit(ModuleEvents.endsComputing, { module: this });
                    success = true;
                }
                catch (error) {
                    success = false;
                }
            }
        }
        return success;
    }
    /**
     * {@inheritdoc}
     */
    initEvents(journey) {
        journey.on(PuppeteerJourneyEvents.JOURNEY_START, async () => {
            this.doms = [];
        });
        journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data) => {
            const wrapper = data.wrapper;
            this.doms = this.doms || [];
            this.doms.push(await wrapper.page.content());
        });
    }
}
