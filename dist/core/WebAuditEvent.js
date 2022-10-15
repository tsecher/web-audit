"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditEvent = void 0;
const events_1 = __importDefault(require("events"));
const WebAuditContext_1 = require("./WebAuditContext");
const WebAuditConfig_1 = require("./WebAuditConfig");
class WebAuditEventClass {
    constructor(event = new events_1.default.EventEmitter()) {
        this.event = event;
    }
    /**
     * Emit event;
     *
     * @param {string} eventName
     * @param args
     */
    emit(eventName, args) {
        this.event.emit(eventName, {
            context: WebAuditContext_1.WebAuditContext,
            config: WebAuditConfig_1.WebAuditConfig,
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
exports.WebAuditEvent = new WebAuditEventClass();
