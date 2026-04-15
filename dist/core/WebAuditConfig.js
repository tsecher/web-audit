/**
 * Config.
 */
export class WebAuditConfigClass {
    logger;
    storage;
    AppConfig;
    constructor(logger, storage, AppConfig) {
        this.logger = logger;
        this.storage = storage;
        this.AppConfig = AppConfig;
    }
}
