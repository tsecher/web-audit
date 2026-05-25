/**
 *
 */
import fs from 'fs';
import path from 'path';

import {WebAuditContextClass} from '##/core/WebAuditContext';
import {StorageInterface} from '##/storage/Storage';
import {AppConfig} from '##/app/conf/AppConfig';
import {StoredInterface} from "##/storage/StoredInterface";

/**
 * store data in
 */
export default class CSVStorage implements StorageInterface {

    static SEPARATOR = ';';

    private dirPath = '';

    private structures: any = {};

    private installData: any = {};

    /**
     * {@inheritdoc}
     */
    get id(): string {
        return 'csv_storage';
    }

    /**
     * {@inheritdoc}
     */
    get name(): string {
        return 'CSV';
    }

    init(urls: URL[], version: string) {
        this.dirPath = path.resolve(AppConfig.getConfig()?.csv_storage?.directory || './analyses', urls[0].hostname);
    }

    /**
     * Init CSV Store file with schema.
     */
    installSchema(stored: StoredInterface, context: WebAuditContextClass): void {
        Object.entries(stored.getSchema().structure).forEach(([group_id, group]: [string, any]) => {
            const group_path = this.getGroupPath(stored, group_id);
            const filePath = this.getFilePath(group_path, context);
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), {recursive: true});
            }

            if (!fs.existsSync(filePath)) {
                const data: any = {};
                Object.entries(group.structure).forEach(([data_id, structure]: [string, any]) => {
                    data[data_id] = structure.label;
                })
                fs.writeFileSync(filePath, this.getCSVLine(data, group_path));

                this.installData[group_path] = data;
                this.structures[group_path] = data;
            }
        })

    }

    /**
     * Add data to csv Store
     */
    add(stored: StoredInterface, group_id: string, context: WebAuditContextClass, data: any): void {
        const group_path = this.getGroupPath(stored, group_id);
        fs.appendFileSync(this.getFilePath(group_path, context), this.getCSVLine(data, group_path));
    }

    /**
     * Replace.
     */
    one(stored: StoredInterface, group_id: string, context: WebAuditContextClass, data: any): void {
        const group_path = this.getGroupPath(stored, group_id);
        fs.rmSync(this.getFilePath(group_path, context));
        this.installSchema(stored, context);
        this.add(stored, group_id, context, data);
    }

    /**
     * Store file.
     */
    file(stored: StoredInterface | null, input: string, context: WebAuditContextClass): void {
        const output = path.join(this.dirPath, stored?.id || '', 'files', String(context?.version || 'undefined'), input);
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
    protected getCSVValues(data: Object, id?: string): any {
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
    protected getCSVLine(data: any, id?: string): string {
        return `${this.getCSVValues(data, id).join(CSVStorage.SEPARATOR)}\r\n`;
    }

    /**
     * Get csv file path.
     *
     * @param id
     * @param context
     * @private
     */
    protected getFilePath(id: string, context: WebAuditContextClass) {
        return path.join(this.dirPath, String(context.version), `${id}.csv`);
    }

    /**
     * Get the data structure from head.
     *
     * @param data
     * @param id
     * @private
     */
    protected getStructuredValues(data: any, id?: string): any {
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
    protected getStringifiedValues(data: any): any {
        const values: any = {};
        Object.keys(data).forEach((key: string) => {values[key] = this.getStringifiedValue(key, data[key], data)});

        return values;
    }

    /**
     * Stringify a value.
     * @param key 
     * @param value 
     * @param data 
     * @returns 
     */
    protected getStringifiedValue(key:string, value:any, data:any):string{
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
    private getGroupPath(stored: StoredInterface, group_id: string) {
        return `${stored.id}/${group_id}`;
    }
}
