"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditConfig = exports.WebAuditConfigClass = void 0;
const Logger_1 = require("../loggers/Logger");
/**
 * Config.
 */
class WebAuditConfigClass {
    constructor() {
        /**
         * Logger object displaying process message.
         *
         * @private
         */
        this._logger = Logger_1.WebAuditLogger;
    }
    /**
     * Logger.
     */
    get logger() {
        return this._logger;
    }
    /**
     * Storage
     */
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
exports.WebAuditConfigClass = WebAuditConfigClass;
exports.WebAuditConfig = new WebAuditConfigClass();
