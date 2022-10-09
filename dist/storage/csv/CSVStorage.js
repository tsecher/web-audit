"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * store data in
 */
class CSVStorage {
    /**
     * Constructor.
     *
     * @param string dir
     *   Path of stored csv.
     */
    constructor(dir) {
        this.dirPath = path_1.default.resolve(dir);
    }
    /**
     * Init CSV Store file.
     */
    installStore(id, context, data) {
        const filePath = this.getFilePath(id, context);
        if (!fs_1.default.existsSync(path_1.default.dirname(filePath))) {
            fs_1.default.mkdirSync(path_1.default.dirname(filePath));
        }
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, this.getCSVLine(data));
        }
    }
    /**
     * Add data to csv Store
     *
     * @param id
     * @param context
     * @param data
     */
    add(id, context, data) {
        fs_1.default.appendFileSync(this.getFilePath(id, context), this.getCSVLine(data));
    }
    /**
     * Get csv values.
     *
     * @param data
     * @private
     */
    getCSVValues(data) {
        return Object.values(data).map((value) => {
            if (typeof value !== 'undefined') {
                return value.toString() || JSON.stringify(value);
            }
            return '';
        });
    }
    /**
     * Return csv line.
     *
     * @param data
     * @private
     */
    getCSVLine(data) {
        return `${this.getCSVValues(data).join(',')}\r\n`;
    }
    /**
     * Get csv file path.
     *
     * @param id
     * @param context
     * @private
     */
    getFilePath(id, context) {
        return path_1.default.join(this.dirPath, String(context.version), `${id}.csv`);
    }
}
exports.default = CSVStorage;
