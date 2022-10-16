import {StorageInterface} from '../Storage';
import {WebAuditContextClass} from '../../core/WebAuditContext';

/**
 * store data in
 */
export default class NoStorage implements StorageInterface {

  /**
   * Init CSV Store file.
   */
  installStore(id: string, context: WebAuditContextClass, data: any): void {
  }

  /**
   * Add data to csv Store
   *
   * @param id
   * @param context
   * @param data
   */
  add(id: string, context: WebAuditContextClass, data: any): void {
  }

}
