import {StorageInterface} from '##/storage/Storage';
import {WebAuditContextClass} from '##/core/WebAuditContext';
import {ModuleInterface} from "##/modules/ModuleInterface";

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
   * Init Store with schema.
   */
  installSchema(id: string, context: WebAuditContextClass, schema: any): void {
  }

  /**
   * Add data to Store
   *
   * @param id
   * @param context
   * @param data
   * @param module
   */
  add(id: string, context: WebAuditContextClass, data: any, module: ModuleInterface): void {
  }

  /**
   * Replace data.
   */
  one(id: string, context: WebAuditContextClass, data: any, module: ModuleInterface): void {
  }

  /**
   * Add file.
   *
   * @param {string} input
   * @param context
   * @param module
   */
  file(input: string, context: any, module: ModuleInterface): void {
  }

}
