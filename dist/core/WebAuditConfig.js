/**
 * Config.
 */
export class WebAuditConfigClass {
    logger;
    storage;
    constructor(logger, storage) {
        this.logger = logger;
        this.storage = storage;
    }
}
