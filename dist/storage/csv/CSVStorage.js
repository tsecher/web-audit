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
    structures = {};
    installData = {};
    defaultContextUrl;
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
        this.defaultContextUrl = urls.at(0);
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
            this.createFile(filePath, group, group_id);
        });
    }
    /**
     * Add data to csv Store
     */
    add(stored, group_id, context, data) {
        const group_path = this.getGroupPath(stored, group_id);
        const header = Object.keys(stored.getSchema().structure[group_id].structure);
        const filePath = this.getFilePath(group_path, context);
        this.createFile(filePath, stored, group_id);
        fs.appendFileSync(filePath, this.getCSVLine(data, header, group_path));
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
    file(stored, data, file_name, context) {
        const group_path = this.getGroupPath(stored, file_name);
        const file_path = this.getFilePath(group_path, context, '');
        fs.mkdirSync(path.dirname(file_path), { recursive: true });
        fs.writeFileSync(this.getFilePath(group_path, context, ''), data);
    }
    /**
     * Create the file if not exists.
     * @param filePath the file path
     * @param stored the stored entity
     * @param group_id the group id.
     */
    createFile(filePath, stored, group_id) {
        if (!fs.existsSync(filePath)) {
            const data = {};
            const group_path = this.getGroupPath(stored, group_id);
            const group = stored.getSchema().structure[group_id];
            Object.entries(group.structure).forEach(([data_id, structure]) => {
                data[data_id] = structure.label;
            });
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, this.getCSVLine(data, Object.keys(group.structure), group_path));
            this.installData[group_path] = data;
            this.structures[group_path] = data;
        }
    }
    /**
     * Get csv values.
     *
     * @param data
     * @param id
     * @private
     */
    getCSVValues(data, header, id) {
        const values = {};
        Object.values(header).forEach((key) => {
            values[key] = this.getStringifiedValue(key, data[key] || '', data);
        });
        return values;
    }
    /**
     * Return csv line.
     *
     * @param data
     * @param id
     * @private
     */
    getCSVLine(data, header, id) {
        return `${Object.values(this.getCSVValues(data, header, id)).join(CSVStorage.SEPARATOR)}\r\n`;
    }
    /**
     * Get csv file path.
     *
     * @param id
     * @param context
     * @private
     */
    getFilePath(id, context, extension = `.csv`) {
        const contextUrl = context.url || this.defaultContextUrl || new URL('https://default');
        const dirPath = path.resolve(AppConfig.getConfig()?.csv_storage?.directory || './analyses', contextUrl.hostname);
        return path.join(dirPath, String(context.version), `${id}${extension}`);
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
