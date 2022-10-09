import {StorageInterface} from '../storage/Storage';
import {LoggerInterface, WebAuditLogger} from '../loggers/Logger';

/**
 * Config.
 */
class WebAuditConfigClass {

    /**
     * Logger object displaying process message.
     *
     * @private
     */
  private _logger: LoggerInterface = WebAuditLogger;

    /**
     * Storage of data.
     *
     * @private
     */
  private _storage?: StorageInterface;

    /**
     * Logger.
     */
  get logger(): LoggerInterface {
    return this._logger;
  }

    /**
     * Storage
     */
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

export const WebAuditConfig = new WebAuditConfigClass();
