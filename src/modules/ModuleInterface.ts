import {WebAuditContextClass} from '../core/WebAuditContext';
import {UrlWrapper} from '../core/UrlWrapper';
import {StoredInterface} from "##/storage/StoredInterface";

export const ModuleEvents = {
    beforeAllUrlProcess: 'beforeAllURLProcess',
    afterAllUrlProcess: 'afterAllURLProcess',
    beforeUrlProcess: 'beforeURLProcess',
    afterUrlProcess: 'afterURLProcess',
    beforeAnalyse: 'beforeAnalyse',
    afterAnalyse: 'afterAnalyse',
    onAnalyseResult: 'onAnalyseResult',
    onAnalyseSummary: 'onAnalyseSummary',
    startsComputing: 'startsComputing',
    endsComputing: 'endsComputing',
};


export const MODULE_TYPES: any = {
    BEFORE: 'before',
    STANDARD: 'standard',
    JOURNEY: 'journey',
};


export interface ModuleInterface extends StoredInterface {

    get name(): string;

    get id(): string;

    get type(): string;

    /**
     * Init before configuration.
     *
     * @param {WebAuditContextClass} context
     */
    init(context: WebAuditContextClass): void;

    /**
     * Analyse urls.
     *
     * @param url
     * @param parser
     */
    analyse(url: UrlWrapper): Promise<boolean>;

    /**
     * Finish process.
     */
    finish(): void;

    /**
     * Return the data schema.
     */
    getSchema(): any;
}
