"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditEventClass = void 0;
const events_1 = __importDefault(require("events"));
class WebAuditEventClass {
    constructor(event = new events_1.default.EventEmitter()) {
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
        var _a;
        this.event.emit(eventName, {
            context: this._context || {},
            config: (_a = this._context) === null || _a === void 0 ? void 0 : _a.config,
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
exports.WebAuditEventClass = WebAuditEventClass;
