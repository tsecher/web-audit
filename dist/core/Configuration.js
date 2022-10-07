"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
class Configuration {
    constructor() {
        this.config = {};
    }
    loadConfiguration(config_json_file) {
        this.config = require(config_json_file);
    }
}
exports.Configuration = Configuration;
