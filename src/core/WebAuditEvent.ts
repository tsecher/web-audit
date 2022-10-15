import events from 'events';

import {WebAuditContext as Context} from './WebAuditContext';
import {WebAuditConfig as Config} from './WebAuditConfig';

class WebAuditEventClass {

  constructor(
    protected event = new events.EventEmitter(),
  ) {
  }

  /**
   * Emit event;
   *
   * @param {string} eventName
   * @param args
   */
  emit(eventName: string, args: any): WebAuditEventClass {
    this.event.emit(
      eventName,
      {
        context: Context,
        config: Config,
        data: args,
      },
    );

    return this;
  }

  /**
   * Listen event.
   *
   * @param {string} eventName
   * @param cb
   * @returns {WebAuditEventClass}
   */
  on(eventName: string, cb: any): WebAuditEventClass {
    this.event.on(eventName, cb);

    return this;
  }
}

export const WebAuditEvent = new WebAuditEventClass();
