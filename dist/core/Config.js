"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
    constructor() {
        this.config = {};
    }
    loadConfiguration(config_json_file) {
        this.config = require(config_json_file);
    }
}
exports.Config = Config;
