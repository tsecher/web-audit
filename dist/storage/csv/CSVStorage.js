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
    /**
     * {@inheritdoc}
     */
    prepare(context) {
    }
    init(urls, version) {
        this.dirPath = path.resolve(AppConfig.getConfig()?.csv_storage?.directory || './analyses', urls[0].hostname);
    }
    /**
     * Init CSV Store file with schema.
     */
    installSchema(stored, context) {
        Object.entries(stored.getSchema().structure).forEach(([group_id, group]) => {
            const group_path = this.getGroupPath(stored, group_id);
            const filePath = this.getFilePath(group_path, context);
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }
            if (!fs.existsSync(filePath)) {
                const data = {};
                Object.entries(group.structure).forEach(([data_id, structure]) => {
                    data[data_id] = structure.label;
                });
                fs.writeFileSync(filePath, this.getCSVLine(data, group_path));
                this.installData[group_path] = data;
                this.structures[group_path] = data;
            }
        });
    }
    /**
     * Add data to csv Store
     */
    add(stored, group_id, context, data) {
        const group_path = this.getGroupPath(stored, group_id);
        fs.appendFileSync(this.getFilePath(group_path, context), this.getCSVLine(data, group_path));
    }
    /**
     * Replace.
     */
    one(stored, group_id, context, data) {
        const group_path = this.getGroupPath(stored, group_id);
        fs.rmSync(this.getFilePath(group_path, context));
        this.installSchema(stored, context);
        this.add(stored, group_id, context, data);
    }
    /**
     * Store file.
     */
    file(stored, input, context) {
        const output = path.join(this.dirPath, stored?.id || '', 'files', String(context?.version || 'undefined'), input);
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
        Object.keys(data).forEach((key) => { values[key] = this.getStringifiedValue(key, data[key], data); });
        return values;
    }
    /**
     * Stringify a value.
     * @param key
     * @param value
     * @param data
     * @returns
     */
    getStringifiedValue(key, value, data) {
        switch (typeof value) {
            case 'number':
                value = value.toString();
                break;
            case 'undefined':
                break;
            default:
                value = value?.toString() || JSON.stringify(value);
        }
        return (value || '').split('\r\n')
            .join('')
            .split('\r')
            .join('')
            .split('\n')
            .join('');
    }
    /**
     * Return the group base path.
     */
    getGroupPath(stored, group_id) {
        return `${stored.id}/${group_id}`;
    }
}
