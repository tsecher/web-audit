import {CSVStorageClass} from "./csv/CSVStorage";

export interface StorageInterface {
    installStore(id: string, context: any, data: any): void;

    add(id: string, context: any, data: any): void
}

// CSV Default storage.
export const CSVStorage = new CSVStorageClass();