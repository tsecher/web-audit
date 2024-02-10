import {WebAuditContextClass} from '##/core/WebAuditContext';

export interface StorageInterface {
  installStore(id: string, context: WebAuditContextClass, data: any): void;

  add(id: string, context: WebAuditContextClass, data: any): void;

  one(id: string, context: WebAuditContextClass, data: any): void;

  file(input: string, context: WebAuditContextClass): void;
}
