import {StorageInterface} from '##/storage/Storage';
import {WebAuditContextClass} from '##/core/WebAuditContext';

/**
 * store data in
 */
export default class NoStorage implements StorageInterface {

  /**
   * {@inheritdoc}
   */
  get id(): string {
    return 'no_storage';
  }

  /**
   * {@inheritdoc}
   */
  get name(): string {
    return 'No storage';
  }

  /**
   * {@inheritdoc}
   */
  init(urls: URL[], version: string) {
  }

  /**
   * Init Store.
   */
  installStore(id: string, context: WebAuditContextClass, data: any): void {
  }

  /**
   * Add data to Store
   *
   * @param id
   * @param context
   * @param data
   */
  add(id: string, context: WebAuditContextClass, data: any): void {
  }

  /**
   * Replace data.
   */
  one(id: string, context: WebAuditContextClass, data: any): void {
  }

  /**
   * Add file.
   *
   * @param {string} input
   * @param context
   */
  file(input: string, context: any): void {
  }

}
