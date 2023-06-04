"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleFinder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AppConfig_1 = require("../conf/AppConfig");
/**
 * Find module according to configuration file.
 */
class ModuleFinderClass {
    /**
     * Return the list of available modules.
     *
     * @returns {ModuleInterface[]}
     */
    getModules() {
        if (!this.modules) {
            this.initModules();
        }
        return this.modules || [];
    }
    /**
     * Return all embed modules.
     *
     * @returns {ModuleInterface[]}
     * @protected
     */
    getEmbedModules() {
        return [];
    }
    /**
     * Init modules.
     *
     * @protected
     */
    initModules() {
        var _a;
        const moduleDataList = (_a = AppConfig_1.AppConfig.getConfig()) === null || _a === void 0 ? void 0 : _a.modules;
        if (moduleDataList && moduleDataList.length) {
            this.modules = this.getModulesFromConfig(moduleDataList);
        }
        else {
            this.modules = this.getEmbedModules();
        }
    }
    /**
     * BUild the module list from module path.
     *
     * @param {string[]} moduleDataList
     * @returns {ModuleInterface[]}
     * @protected
     */
    getModulesFromConfig(moduleDataList) {
        const modulesList = [];
        for (const moduleData of moduleDataList) {
            const modulePath = path_1.default.resolve(process.cwd(), moduleData.path);
            if (fs_1.default.existsSync(modulePath)) {
                const ModuleClass = require(modulePath)[moduleData.id];
                modulesList.push(new ModuleClass());
            }
        }
        return modulesList;
    }
}
exports.ModuleFinder = new ModuleFinderClass();
