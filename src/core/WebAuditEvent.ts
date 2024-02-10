import events from 'events';

import {WebAuditContextClass} from '##/core/WebAuditContext';

export class WebAuditEventClass {

  private _context: WebAuditContextClass | undefined;

  constructor(
    protected event = new events.EventEmitter(),
  ) {
  }

  get context(): WebAuditContextClass | undefined {
    return this._context;
  }

  set context(value: WebAuditContextClass | undefined) {
    this._context = value;
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
        context: this._context || {},
        config: this._context?.config,
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
