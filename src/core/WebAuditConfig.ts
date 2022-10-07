import {StorageInterface} from "../storage/Storage";
import {LoggerInterface, WebAuditLogger} from "../loggers/Logger";

class WebAuditConfigClass {
    private _logger: LoggerInterface = WebAuditLogger;
    private _storage?: StorageInterface;

    get logger(): LoggerInterface {
        return this._logger;
    }

    get storage(): StorageInterface | undefined {
        if (!this._storage) {
            this.logger.exit(`You have to declare a storage. 
            Ex: WebAuditConfig.setStorage( ... ) `);
        }
        return this._storage;
    }

    setLogger(logger: LoggerInterface) {
        this._logger = logger;
    }

    setStorage(storage: StorageInterface) {
        this._storage = storage;
    }
}

export const WebAuditConfig = new WebAuditConfigClass()