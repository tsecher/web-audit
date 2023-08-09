"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditLogger = exports.LoggerClass = void 0;
const colors_1 = __importDefault(require("colors"));
/**
 * Logger class.
 */
class LoggerClass {
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
    result(name, values, id) {
        this.log(`${colors_1.default.bgGreen(`[${name}] : `)}`, id);
        console.table({ values }, Object.keys(values)
            .filter((item) => item !== 'url'));
    }
    /**
     * {@inheritdoc}
     */
    log(data, id, color) {
        const variables = [];
        if (id) {
            variables.push(`[${id}] `);
        }
        variables.push(data);
        if (color) {
            console.log(color(...variables));
        }
        else {
            console.log(...variables);
        }
    }
}
exports.LoggerClass = LoggerClass;
/**
 * Default logger class.
 */
exports.WebAuditLogger = new LoggerClass();
