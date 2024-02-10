import events from 'events';
export class WebAuditEventClass {
    event;
    _context;
    constructor(event = new events.EventEmitter()) {
        this.event = event;
    }
    get context() {
        return this._context;
    }
    set context(value) {
        this._context = value;
    }
    /**
     * Emit event;
     *
     * @param {string} eventName
     * @param args
     */
    emit(eventName, args) {
        this.event.emit(eventName, {
            context: this._context || {},
            config: this._context?.config,
            data: args,
        });
        return this;
    }
    /**
     * Listen event.
     *
     * @param {string} eventName
     * @param cb
     * @returns {WebAuditEventClass}
     */
    on(eventName, cb) {
        this.event.on(eventName, cb);
        return this;
    }
}
