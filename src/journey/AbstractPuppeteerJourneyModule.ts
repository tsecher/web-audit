import {MODULE_TYPES, ModuleInterface} from '##/modules/ModuleInterface';
import {UrlWrapper} from '##/core/UrlWrapper';
import {WebAuditContextClass} from '##/core/WebAuditContext';
import {AbstractJourneyModuleInterface} from '##/journey/AbstractJourneyModuleInterface';
import {JourneyInterface} from '##/journey/JourneyInterface';
import {AbstractPuppeteerJourney, PuppeteerJourneyEvents} from '##/journey/AbstractPuppeteerJourney';

export abstract class AbstractPuppeteerJourneyModule implements ModuleInterface, AbstractJourneyModuleInterface {

    abstract get id(): string;

    abstract get name(): string;

    abstract init(context: WebAuditContextClass): void;

    abstract initEvents(journey: JourneyInterface): void;

    abstract getSchema(): any;

    protected defaultOptions?: any;

    protected context?: WebAuditContextClass;

    protected journeyContexts: any = [];
    protected journeySteps: any = [];

    /**
     * {@inheritdoc}
     */
    get type(): string {
        return MODULE_TYPES.JOURNEY;
    }

    /**
     * {@inheritdoc}
     */
    getOptions(inputOptions: any = {}): any {
        return {
            ...this.defaultOptions,
            ...inputOptions,
        };
    }

    /**
     * {@inheritdoc}
     */
    analyse(url: UrlWrapper): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     * {@inheritdoc}
     */
    initJourney(journey: JourneyInterface): AbstractJourneyModuleInterface {
        this.initEvents(journey);
        if (journey instanceof AbstractPuppeteerJourney) {
            journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data: any) => {
                this.journeyContexts = [];
                this.journeySteps = [];
            });
            journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data: any) => this.journeyContexts.push(data));
            journey.on(PuppeteerJourneyEvents.JOURNEY_BEFORE_STEP, async (data: any) => this.journeySteps.push(data));
        }
        return this;
    }

    /**
     * {@inheritdoc}
     */
    finish(): void {
        this.journeyContexts = [];
        this.journeySteps = [];
    }


}
