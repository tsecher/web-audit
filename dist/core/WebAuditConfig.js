"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditConfig = void 0;
const Logger_1 = require("../loggers/Logger");
class WebAuditConfigClass {
    constructor() {
        this._logger = Logger_1.WebAuditLogger;
    }
    get logger() {
        return this._logger;
    }
    get storage() {
        if (!this._storage) {
            this.logger.exit(`You have to declare a storage. 
            Ex: WebAuditConfig.setStorage( ... ) `);
        }
        return this._storage;
    }
    setLogger(logger) {
        this._logger = logger;
    }
    setStorage(storage) {
        this._storage = storage;
    }
}
exports.WebAuditConfig = new WebAuditConfigClass();
