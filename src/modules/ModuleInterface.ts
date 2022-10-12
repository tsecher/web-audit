import {WebAuditConfigClass} from '../core/WebAuditConfig';
import {WebAuditContextClass} from '../core/WebAuditContext';

export interface ModuleInterface {

  get name(): string;

  /**
   * Init before configuration.
   *
   * @param {WebAuditConfigClass} config
   * @param {WebAuditContextClass} context
   */
  init(config: WebAuditConfigClass, context: WebAuditContextClass): void;

  /**
   * Analyse urls.
   *
   * @param url
   * @param parser
   */
  analyse(url: URL): void;

  /**
   * Finish process.
   */
  finish(): void;

}
