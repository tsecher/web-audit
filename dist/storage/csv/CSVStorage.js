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
     * @param dir Path of stored csv.
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
     * Store file.
     *
     * @param input
     * @param context
     */
    file(input, context) {
        const output = path_1.default.join(this.dirPath, String((context === null || context === void 0 ? void 0 : context.version) || 'undefined'), input);
        fs_1.default.mkdirSync(path_1.default.dirname(output), { recursive: true });
        fs_1.default.renameSync(input, output);
    }
    /**
     * Get csv values.
     *
     * @param data
     * @param id
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
     * @param id
     * @private
     */
    getCSVLine(data, id) {
        return `${this.getCSVValues(data, id).join(CSVStorage.SEPARATOR)}\r\n`;
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
        const values = {};
        Object.keys(data).forEach((key) => {
            let value = data[key];
            switch (typeof value) {
                case 'number':
                    value = value.toString();
                    break;
                case 'undefined':
                    break;
                default:
                    value = (value === null || value === void 0 ? void 0 : value.toString()) || JSON.stringify(value);
            }
            values[key] = value.split('\r\n').join('').split('\r').join('').split('\n').join('');
        });
        return values;
    }
}
exports.default = CSVStorage;
CSVStorage.SEPARATOR = ';';
