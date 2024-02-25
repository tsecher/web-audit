/**
 *
 */
import fs from 'fs';
import path from 'path';
import { AppConfig } from '##/app/conf/AppConfig';
/**
 * store data in
 */
export default class CSVStorage {
    static SEPARATOR = ';';
    dirPath = '';
    structures = {};
    installData = {};
    /**
     * {@inheritdoc}
     */
    get id() {
        return 'csv_storage';
    }
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'CSV';
    }
    init(urls, version) {
        this.dirPath = path.resolve(AppConfig.getConfig()?.csv_storage?.directory || './analyses', urls[0].hostname);
    }
    /**
     * Init CSV Store file.
     */
    installStore(id, context, data) {
        const filePath = this.getFilePath(id, context);
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, this.getCSVLine(data, id));
        }
        this.installData[id] = data;
        this.structures[id] = data;
    }
    /**
     * Add data to csv Store
     *
     * @param id
     * @param context
     * @param data
     */
    add(id, context, data) {
        fs.appendFileSync(this.getFilePath(id, context), this.getCSVLine(data, id));
    }
    /**
     * Replace.
     * @param {string} id
     * @param {WebAuditContextClass} context
     * @param data
     */
    one(id, context, data) {
        fs.rmSync(this.getFilePath(id, context));
        this.installStore(id, context, this.installData[id]);
        this.add(id, context, data);
    }
    /**
     * Store file.
     *
     * @param input
     * @param context
     */
    file(input, context) {
        const output = path.join(this.dirPath, String(context?.version || 'undefined'), input);
        fs.mkdirSync(path.dirname(output), { recursive: true });
        fs.renameSync(input, output);
    }
    /**
     * Get csv values.
     *
     * @param data
     * @param id
     * @private
     */
    getCSVValues(data, id) {
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
    getCSVLine(data, id) {
        return `${this.getCSVValues(data, id).join(CSVStorage.SEPARATOR)}\r\n`;
    }
    /**
     * Get csv file path.
     *
     * @param id
     * @param context
     * @private
     */
    getFilePath(id, context) {
        return path.join(this.dirPath, String(context.version), `${id}.csv`);
    }
    /**
     * Get the data structure from head.
     *
     * @param data
     * @param id
     * @private
     */
    getStructuredValues(data, id) {
        if (!id || !this.structures[id]) {
            return Object.values(data);
        }
        const values = [];
        Object.keys(this.structures[id]).forEach((key) => {
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
    getStringifiedValues(data) {
        const values = {};
        Object.keys(data).forEach((key) => {
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
            values[key] = (value || '').split('\r\n')
                .join('')
                .split('\r')
                .join('')
                .split('\n')
                .join('');
        });
        return values;
    }
}
