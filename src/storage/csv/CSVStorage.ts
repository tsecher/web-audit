/**
 *
 */
import fs from 'fs';
import path from 'path';

import {StorageInterface} from '../Storage';
import {WebAuditContextClass} from '../../core/WebAuditContext';

/**
 * store data in
 */
export default class CSVStorage implements StorageInterface {

  private dirPath: string;

  private structures: any = {};

  /**
   * Constructor.
   *
   * @param string dir
   *   Path of stored csv.
   */
  constructor(
    dir: string,
  ) {
    this.dirPath = path.resolve(dir);
  }

  /**
   * Init CSV Store file.
   */
  installStore(id: string, context: WebAuditContextClass, data: any): void {
    const filePath = this.getFilePath(id, context);
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), {recursive: true});
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, this.getCSVLine(data, id));
    }

    this.structures[id] = data;
  }

  /**
   * Add data to csv Store
   *
   * @param id
   * @param context
   * @param data
   */
  add(id: string, context: WebAuditContextClass, data: any): void {
    fs.appendFileSync(this.getFilePath(id, context), this.getCSVLine(data, id));
  }

  /**
   * Get csv values.
   *
   * @param data
   * @private
   */
  private getCSVValues(data: Object, id?: string): any {
    const values = this.getStringifiedValues(data);
    return this.getStructuredValues(values, id);
  }

  /**
   * Return csv line.
   *
   * @param data
   * @private
   */
  private getCSVLine(data: any, id?: string): string {
    return `${this.getCSVValues(data, id).join(',')}\r\n`;
  }

  /**
   * Get csv file path.
   *
   * @param id
   * @param context
   * @private
   */
  private getFilePath(id: string, context: WebAuditContextClass) {
    return path.join(this.dirPath, String(context.version), `${id}.csv`);
  }

  /**
   * Get the data structure from head.
   *
   * @param data
   * @param id
   * @private
   */
  private getStructuredValues(data: any, id?: string): any {
    if (!id || !this.structures[id]) {
      return Object.values(data);
    }

    const values: string[] = [];
    Object.keys(this.structures[id]).forEach((key: string) => {
      values.push(data[key] || '');
    });

    return values;
  }

  /**
   * Stringify data values.
   *
   * @param data
   * @private
   */
  private getStringifiedValues(data: any): any {
    Object.keys(data).forEach((key: string) => {
      const value = data[key];
      if (value && typeof value !== 'undefined') {
        data[key] = value.toString() || JSON.stringify(value);
      } else {
        data[key] = '';
      }
    });

    return data;
  }

}
