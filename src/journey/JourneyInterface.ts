import {UrlWrapper} from '##/core/UrlWrapper';
import {WebAuditContextClass} from '##/core/WebAuditContext';
import {PageWrapper} from '##/journey/PageWrapper';

export interface JourneyInterface {

  /**
   * The name.
   *
   * @returns {string}
   */
  get name(): string;

  /**
   * The id.
   *
   * @returns {string}
   */
  get id(): string;

  /**
   * Set the context
   *
   * @returns {JourneyInterface}
   */
  set context(context: WebAuditContextClass | undefined);

  /**
   * The context.
   *
   * @returns {WebAuditContextClass}
   */
  get context(): WebAuditContextClass | undefined;

  /**
   * Action before all process.
   *
   * @param {PageWrapper} wrapper
   * @param {UrlWrapper[]} urls
   * @returns {Promise<void>}
   */
  beforeAll(wrapper: PageWrapper, urls: UrlWrapper[]): Promise<void>;

  /**
   * Actoin before each url.
   *
   * @param {PageWrapper} wrapper
   * @param urlWrapper
   * @returns {Promise<void>}
   */
  beforeEach(wrapper: PageWrapper, urlWrapper: UrlWrapper): Promise<void>;

  /**
   * Return true if eligible.
   *
   * @param {PageWrapper} wrapper
   * @param {UrlWrapper} urlWrapper
   * @returns {Promise<void>}
   */
  isEligible(wrapper: PageWrapper, urlWrapper: UrlWrapper): Promise<boolean>;

  /**
   * User journey description.
   *
   * @param wrapper
   * @param logger
   * @returns {Promise<void>}
   */
  journey(wrapper: PageWrapper, url: UrlWrapper): Promise<void>;

  /**
   * Play the user journey.
   *
   * @returns {Promise<void>}
   */
  play(wrapper: PageWrapper, url: UrlWrapper): Promise<void>;
}
