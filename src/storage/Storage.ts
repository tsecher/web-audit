import {WebAuditContextClass} from '../core/WebAuditContext';

export interface StorageInterface {
    installStore(id: string, context: any, data: any): void;

    add(id: string, context: any, data: any): void;

    file(input: string, context: any): void;
}
