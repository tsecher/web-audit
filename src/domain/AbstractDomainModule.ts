import {ModuleInterface} from '../modules/ModuleInterface';
import {UrlWrapper} from '../core/UrlWrapper';
import {WebAuditContextClass} from '../core/WebAuditContext';

/**
 * Abstract domain module.
 */
export abstract class AbstractDomainModule implements ModuleInterface {

  private cache: any = {};

  abstract get id(): string;

  abstract get name(): string;

  abstract init(context: WebAuditContextClass): void;

  abstract analyse(url: UrlWrapper): Promise<boolean>;

  abstract finish(): void;

  async analyseDomain(url: UrlWrapper) {
    if (this.isAnalysableDomain(url.url.hostname)) {
      return this.analyse(url);
    }
    return true;
  }

  /**
   * Return true if domain can be analysed.
   *
   * @param {string} domain
   * @returns {boolean}
   */
  isAnalysableDomain(domain: string): boolean {
    const date = new Date().getTime() + 86400000;
    if (this.cache[domain] && this.cache[domain] < date) {
      return false;
    } else {
      this.cache[domain] = date;
    }
    return true;
  }

}
