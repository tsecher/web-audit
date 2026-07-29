import {StorageInterface} from '##/storage/Storage';
import {WebAuditContextClass} from '##/core/WebAuditContext';
import {StoredInterface} from "##/storage/StoredInterface";

/**
 * store data in
 */
export default class NoStorage implements StorageInterface {

    /**
     * {@inheritdoc}
     */
    get id(): string {
        return 'no_storage';
    }

    /**
     * {@inheritdoc}
     */
    get name(): string {
        return 'No storage';
    }

    /**
     * {@inheritdoc}
     */
    prepare(context: WebAuditContextClass): void {
    }

    /**
     * {@inheritdoc}
     */
    init(urls: URL[], version: string) {
    }

    /**
     * Init Store with schema.
     */
    installSchema(stored: StoredInterface, context: WebAuditContextClass): void {
    }

    /**
     * Add data to Store
     */
    add(stored: StoredInterface, group_id: string, context: WebAuditContextClass, data: any): void {
    }

    /**
     * Replace data.
     */
    one(stored: StoredInterface, group_id: string, context: WebAuditContextClass, data: any): void {
    }

    /**
     * Add file.
     */
    file(stored: StoredInterface, input: string, context: WebAuditContextClass): void {
    }

}
