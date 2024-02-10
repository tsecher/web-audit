import { AbstractDomainModule } from '../../domain/AbstractDomainModule';
import { ModuleEvents } from '../ModuleInterface';
/**
 * Mozilla Observatory Module events.
 */
export const GreenWebFoundationModuleEvents = {
    createGreenWebFoundationModule: 'mozilla_observatory_module__createGreenWebFoundationModule',
    onResult: 'mozilla_observatory_module__onResult',
};
/**
 * Mozilla Observatory Validator.
 */
export class GreenWebFoundationModule extends AbstractDomainModule {
    /**
     * Context.
     * @type {WebAuditContextClass}
     * @private
     */
    context;
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'GreenWebFoundation';
    }
    /**
     * {@inheritdoc}
     */
    get id() {
        return `green_web_foundation`;
    }
    /**
     * {@inheritdoc}
     */
    async init(context) {
        this.context = context;
        // Install store.
        this.context.config.storage?.installStore('green_web_foundation', this.context, {
            url: 'URL',
            hosted_by: 'Hosted by',
            hosted_by_website: 'Hosted by website',
            partner: 'Partner',
            green: 'Green',
            hosted_by_id: 'Hosted by ID', // eslint-disable-line @typescript-eslint/naming-convention
        });
        // Emit.
        this.context.eventBus.emit(GreenWebFoundationModuleEvents.createGreenWebFoundationModule, { module: this });
    }
    /**
     * {@inheritdoc}
     */
    async analyseDomain(urlWrapper) {
        try {
            this.context?.eventBus.emit(ModuleEvents.startsComputing, { module: this });
            const endpoint = `https://api.thegreenwebfoundation.org/api/v3/greencheck/${urlWrapper.url.hostname}`;
            const response = await fetch(endpoint, { method: 'GET' });
            const result = await response.json();
            result.url = urlWrapper.url.hostname;
            const summary = {
                url: urlWrapper.url.hostname,
                hosted_by: result.hosted_by,
                hosted_by_website: result.hosted_by_website,
                partner: result.partner,
                green: result.green,
            };
            this.context?.eventBus.emit(GreenWebFoundationModuleEvents.onResult, {
                module: this,
                url: urlWrapper,
                result: result,
            });
            this.context?.eventBus.emit(ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: result });
            this.context?.config?.logger.result(`Green Web Foundation`, summary, urlWrapper.url.toString());
            // @ts-ignore
            this.context?.config?.storage?.one('green_web_foundation', this.context, result);
            this.context?.eventBus.emit(ModuleEvents.endsComputing, { module: this });
            return true;
        }
        catch (err) {
            return false;
        }
    }
    /**
     * {@inheritdoc}
     */
    finish() {
    }
}
