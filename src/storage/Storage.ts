export interface StorageInterface {
    installStore(id: string, context: any, data: any): void;

    add(id: string, context: any, data: any): void
}