import {WebAuditContextClass} from '##/core/WebAuditContext';
import {StoredInterface} from "##/storage/StoredInterface";

export interface StorageInterface {

    get name(): string;

    get id(): string;

    prepare(context: WebAuditContextClass): void;

    init(urls: URL[], version: string): void;

    installSchema(stored: StoredInterface, context: WebAuditContextClass): void;

    add(stored: StoredInterface, group_id: string, context: WebAuditContextClass, data: any): void;

    one(stored: StoredInterface, group_id: string, context: WebAuditContextClass, data: any): void;

    file(stored: StoredInterface | null, input: string, context: WebAuditContextClass): void;
}
