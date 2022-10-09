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
      fs.mkdirSync(path.dirname(filePath));
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, this.getCSVLine(data));
    }
  }

    /**
     * Add data to csv Store
     *
     * @param id
     * @param context
     * @param data
     */
  add(id: string, context: WebAuditContextClass, data: any): void {
    fs.appendFileSync(this.getFilePath(id, context), this.getCSVLine(data));
  }

    /**
     * Get csv values.
     *
     * @param data
     * @private
     */
  private getCSVValues(data: Object): any {
    return Object.values(data).map((value) => {
      if (typeof value !== 'undefined') {
        return value.toString() || JSON.stringify(value);
      }
      return '';
    });
  }

    /**
     * Return csv line.
     *
     * @param data
     * @private
     */
  private getCSVLine(data: any): string {
    return `${this.getCSVValues(data).join(',')}\r\n`;
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
}
