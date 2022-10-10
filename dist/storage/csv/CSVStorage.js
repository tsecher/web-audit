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
        this.structures = {};
        this.dirPath = path_1.default.resolve(dir);
    }
    /**
     * Init CSV Store file.
     */
    installStore(id, context, data) {
        const filePath = this.getFilePath(id, context);
        if (!fs_1.default.existsSync(path_1.default.dirname(filePath))) {
            fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
        }
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, this.getCSVLine(data, id));
        }
        this.structures[id] = data;
    }
    /**
     * Add data to csv Store
     *
     * @param id
     * @param context
     * @param data
     */
    add(id, context, data) {
        fs_1.default.appendFileSync(this.getFilePath(id, context), this.getCSVLine(data, id));
    }
    /**
     * Get csv values.
     *
     * @param data
     * @private
     */
    getCSVValues(data, id) {
        const values = this.getStringifiedValues(data);
        return this.getStructuredValues(values, id);
    }
    /**
     * Return csv line.
     *
     * @param data
     * @private
     */
    getCSVLine(data, id) {
        return `${this.getCSVValues(data, id).join(',')}\r\n`;
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
    /**
     * Get the data structure from head.
     *
     * @param data
     * @param id
     * @private
     */
    getStructuredValues(data, id) {
        if (!id || !this.structures[id]) {
            return Object.values(data);
        }
        const values = [];
        Object.keys(this.structures[id]).forEach((key) => {
            values.push(data[key] || '');
        });
        return values;
    }
    /**
     * Stringify data values.
     *
     * @param data
     * @private
     */
    getStringifiedValues(data) {
        Object.keys(data).forEach((key) => {
            const value = data[key];
            if (value && typeof value !== 'undefined') {
                data[key] = value.toString() || JSON.stringify(value);
            }
            else {
                data[key] = '';
            }
        });
        return data;
    }
}
exports.default = CSVStorage;
