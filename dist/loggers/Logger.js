"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditLogger = exports.LoggerClass = void 0;
const colors_1 = __importDefault(require("colors"));
const WebAuditContext_1 = require("../core/WebAuditContext");
/**
 * Logger class.
 */
class LoggerClass {
    /**
     * {@inheritdoc}
     */
    log(data, id, color) {
        var _a, _b;
        if (!((_a = WebAuditContext_1.WebAuditContext.current) === null || _a === void 0 ? void 0 : _a.isSame(this.previousContext))) {
            console.log(`======== ${(_b = WebAuditContext_1.WebAuditContext.current) === null || _b === void 0 ? void 0 : _b.toString()}`);
            this.previousContext = WebAuditContext_1.WebAuditContext.current;
        }
        const variables = [];
        if (id)
            variables.push(`[${id}] `);
        variables.push(data);
        if (color) {
            console.log(color(...variables));
        }
        else {
            console.log(...variables);
        }
    }
    error(data, id) {
        this.log(data, id, colors_1.default.red);
    }
    message(data, id) {
        this.log(data, id);
    }
    success(data, id) {
        this.log(data, id, colors_1.default.green);
    }
    warning(data, id) {
        this.log(data, id, colors_1.default.yellow);
    }
    exit(data, id) {
        this.error(data, id);
        process.exit();
    }
}
exports.LoggerClass = LoggerClass;
/**
 * Default logger class.
 */
exports.WebAuditLogger = new LoggerClass();
