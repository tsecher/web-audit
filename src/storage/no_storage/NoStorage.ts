import {StorageInterface} from '../Storage';
import {WebAuditContextClass} from '../../core/WebAuditContext';

/**
 * store data in
 */
export default class NoStorage implements StorageInterface {

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
