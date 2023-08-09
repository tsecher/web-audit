import {StorageInterface} from '../storage/Storage';
import {LoggerInterface} from '../loggers/Logger';

/**
 * Config.
 */
export class WebAuditConfigClass {

  constructor(
    public logger: LoggerInterface,
    public storage: StorageInterface,
  ) {
  }
}
