"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = void 0;
const fs_1 = __importDefault(require("fs"));
class AppConfigClass {
    /**
     * Update the config.
     *
     * @param {string | object} input
     * @returns {this}
     */
    setConfig(input) {
        if (typeof input === 'string') {
            if (fs_1.default.existsSync(input)) {
                this.config = JSON.parse(fs_1.default.readFileSync(input, 'utf-8'));
            }
            else {
                this.checkConfig();
            }
        }
        else {
            this.config = input;
        }
        return this;
    }
    /**
     * Return the config.
     *
     * @returns {any}
     */
    getConfig() {
        this.checkConfig();
        return this.config;
    }
    /**
     * Check config initialisation.
     *
     * @private
     */
    checkConfig() {
        if (!this.config) {
            throw new Error(`No config file defined. Please use AppConfig.setConfig(configFilePath)`);
        }
    }
}
exports.AppConfig = new AppConfigClass();
