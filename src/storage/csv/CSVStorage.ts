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

  static SEPARATOR = ';';

  private readonly dirPath: string;

  private structures: any = {};

  /**
   * Constructor.
   *
   * @param dir Path of stored csv.
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
   * Store file.
   *
   * @param input
   * @param context
   */
  file(input: string, context: WebAuditContextClass): void {
    const output = path.join(this.dirPath, String(context?.version || 'undefined'), input);
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.renameSync(input, output);
  }

  /**
   * Get csv values.
   *
   * @param data
   * @param id
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
   * @param id
   * @private
   */
  private getCSVLine(data: any, id?: string): string {
    return `${this.getCSVValues(data, id).join(CSVStorage.SEPARATOR)}\r\n`;
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
    const values: any = {};
    Object.keys(data).forEach((key: string) => {
      let value = data[key];
      switch (typeof value) {
        case 'number':
          value = value.toString();
          break;
        case 'undefined':
          break;
        default:
          value = value?.toString() || JSON.stringify(value);
      }
      values[key] = value.split('\r\n').join('').split('\r').join('').split('\n').join('');
    });

    return values;
  }

}
