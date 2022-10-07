/**
 *
 */
import {fsync} from "fs";
import {WebAuditConfig as Config} from "../../core/WebAuditConfig";
import {StorageInterface} from "../Storage";

export class CSVStorageClass implements StorageInterface {

    private dir?: string;

    initDir() {
        if (!this.dir) {
            Config.logger.error("Storage", "CSV Storage",
                `No directory for csv storage is declared. If you want to use CSV Storage, 
                please define directory where csv will be stored.
                Ex: CSVStorage.setDir('./my-path)`);
        }
    }

    setDir(destination_dir: string) {
        this.dir = destination_dir;
    }

    installStore(id: string, context: any, data: any): void {
        this.initDir();
    }

    add(id: string, context: any, data: any): void {
        this.initDir();
    }
}