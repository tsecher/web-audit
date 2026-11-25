/**
 *
 */
import fs from 'fs';
import path from 'path';

import {WebAuditContextClass} from '##/core/WebAuditContext';
import {StorageInterface} from '##/storage/Storage';
import {AppConfig} from '##/app/conf/AppConfig';
import {StoredInterface} from "##/storage/StoredInterface";
import { Url } from 'url';
import { takeCoverage } from 'v8';

/**
 * store data in
 */
export default class CSVStorage implements StorageInterface {

    static SEPARATOR = ';';

    private structures: any = {};

    private installData: any = {};

    private defaultContextUrl: URL | undefined;

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

    /**
     * {@inheritdoc}
     */
    prepare(context: WebAuditContextClass): void {
    }

    init(urls: URL[], version: string) {
        this.defaultContextUrl = urls.at(0);
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

    
            this.createFile(filePath, stored, group_id);
        })

    }

    /**
     * Add data to csv Store
     */
    add(stored: StoredInterface, group_id: string, context: WebAuditContextClass, data: any): void {
        const group_path = this.getGroupPath(stored, group_id);
        const header = Object.keys(stored.getSchema().structure[group_id].structure);
        const filePath = this.getFilePath(group_path, context);
        
        this.createFile(filePath, stored, group_id);
        fs.appendFileSync(filePath, this.getCSVLine(data, header, group_path));
    }

    /**
     * Replace.
     */
    one(stored: StoredInterface, group_id: string, context: WebAuditContextClass, data: any): void {
        const group_path = this.getGroupPath(stored, group_id);
        const file = this.getFilePath(group_path, context);
        
        if( fs.existsSync(file)){
            fs.rmSync(file, {recursive: true});
        }
        
        this.add(stored, group_id, context, data);
    }

    /**
     * Store file.
     */
    file(stored: StoredInterface | null, data: string, file_name: string, context: WebAuditContextClass): void {
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
    protected createFile(filePath: string, stored: StoredInterface, group_id: string) {
        if (!fs.existsSync(filePath)) {       
            const data: any = {};
            const group_path = this.getGroupPath(stored, group_id);
            const group = stored.getSchema().structure[group_id]; 
            Object.entries(group.structure).forEach(([data_id, structure]: [string, any]) => {
                data[data_id] = structure.label;
            })

            fs.mkdirSync(path.dirname(filePath), { recursive: true});
            fs.writeFileSync(filePath, this.getCSVLine(data, Object.keys(group.structure), group_path));
            
            if(!this.installData[group_path]){
                this.installData[group_path] = data;
                this.structures[group_path] = data;
            }
        }
    }

    /**
     * Get csv values.
     *
     * @param data
     * @param id
     * @private
     */
    protected getCSVValues(data: any, header: Object, id?: string): any {
        const values: any = {};
        Object.values(header).forEach((key: string) => {
            values[key] = this.getStringifiedValue(key, data[key] || '', data)
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
    protected getCSVLine(data: any, header: any, id?: string): string {
        return `${Object.values(this.getCSVValues(data, header, id)).join(CSVStorage.SEPARATOR)}\r\n`;
    }

    /**
     * Get csv file path.
     *
     * @param id
     * @param context
     * @private
     */
    protected getFilePath(id: string, context: WebAuditContextClass, extension: string = `.csv`) {
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
    protected getStringifiedValue(key: string, value: any, data: any): string {
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
