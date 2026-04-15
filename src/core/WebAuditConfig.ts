import {StorageInterface} from '##/storage/Storage';
import {LoggerInterface} from '##/loggers/Logger';
import {AppConfigClass} from "##/app/conf/AppConfig";

/**
 * Config.
 */
export class WebAuditConfigClass {

    constructor(
        public logger: LoggerInterface,
        public storage: StorageInterface,
        public AppConfig: AppConfigClass,
    ) {
    }
}
