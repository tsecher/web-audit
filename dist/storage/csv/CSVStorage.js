"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVStorageClass = void 0;
const WebAuditConfig_1 = require("../../core/WebAuditConfig");
class CSVStorageClass {
    initDir() {
        if (!this.dir) {
            WebAuditConfig_1.WebAuditConfig.logger.error("Storage", "CSV Storage", `No directory for csv storage is declared. If you want to use CSV Storage, 
                please define directory where csv will be stored.
                Ex: CSVStorage.setDir('./my-path)`);
        }
    }
    setDir(destination_dir) {
        this.dir = destination_dir;
    }
    installStore(id, context, data) {
        this.initDir();
    }
    add(id, context, data) {
        this.initDir();
    }
}
exports.CSVStorageClass = CSVStorageClass;
