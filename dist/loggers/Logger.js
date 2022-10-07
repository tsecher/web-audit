"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditLogger = exports.LoggerClass = void 0;
const colors_1 = __importDefault(require("colors"));
class LoggerClass {
    constructor() {
        /**
         * Log cache
         */
        this.cache = {
            id: null,
            context: null,
        };
        this.defaultColor = (x) => {
            return x;
        };
    }
    /**
     * {@inheritdoc}
     */
    log(data, id, context, color) {
        color = color || this.defaultColor;
        if (this.isNewIdAndContext(id, context)) {
            console.log(color(`======== ${id} : ${context}`));
        }
        console.log(color(data));
    }
    error(data, id, context) {
        this.log(data, id, context, colors_1.default.red);
    }
    message(data, id, context) {
        this.log(data, id, context);
    }
    success(data, id, context) {
        this.log(data, id, context, colors_1.default.green);
    }
    warning(data, id, context) {
        this.log(data, id, context, colors_1.default.yellow);
    }
    isNewIdAndContext(id, context) {
        if (`${id}||${context}` !== `${this.cache.id}||${this.cache.context}`) {
            this.cache.id = id;
            this.cache.context = context;
            return true;
        }
        return false;
    }
}
exports.LoggerClass = LoggerClass;
exports.WebAuditLogger = new LoggerClass();
