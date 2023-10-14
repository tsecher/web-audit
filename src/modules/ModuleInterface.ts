import {WebAuditContextClass} from '../core/WebAuditContext';
import {UrlWrapper} from '../core/UrlWrapper';

export const ModuleEvents = {
  beforeUrlProcess: 'beforeURLProcess',
  afterUrlProcess: 'afterURLProcess',
  beforeAnalyse: 'beforeAnalyse',
  afterAnalyse: 'afterAnalyse',
  onAnalyseResult: 'onAnalyseResult',
  startsComputing: 'startsComputing',
  endsComputing: 'endsComputing',
};

export interface ModuleInterface {

  get name(): string;

  get id(): string;

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

}
