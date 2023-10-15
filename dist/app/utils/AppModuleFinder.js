"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleFinder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AppConfig_1 = require("../conf/AppConfig");
const LighthouseModule_1 = require("../../modules/lighthouse/LighthouseModule");
const EcoIndexModule_1 = require("../../modules/ecoindex/EcoIndexModule");
const CPUModule_1 = require("../../modules/cpu/CPUModule");
const W3cValidatorModule_1 = require("../../modules/w3c/W3cValidatorModule");
const MozillaObservatoryModule_1 = require("../../modules/mozilla-observatory/MozillaObservatoryModule");
const GreenWebFoundationModule_1 = require("../../modules/green-web-foundation/GreenWebFoundationModule");
/**
 * Find module according to configuration file.
 */
class ModuleFinderClass {
    /**
     * Return the list of available modules.
     *
     * @returns {ModuleInterface[]}
     */
    getModules(force = false) {
        if (force || !this.modules) {
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
        return [
            new LighthouseModule_1.LighthouseModule(),
            new EcoIndexModule_1.EcoIndexModule(),
            new W3cValidatorModule_1.W3cValidatorModule(),
            new CPUModule_1.CPUModule(),
            new MozillaObservatoryModule_1.MozillaObservatoryModule(),
            new GreenWebFoundationModule_1.GreenWebFoundationModule(),
        ];
    }
    /**
     * Init modules.
     *
     * @protected
     */
    initModules() {
        const modules = {};
        this.getEmbedModules()
            .concat(this.getModulesFromConfig())
            .map((module) => {
            modules[module.id] = module;
        });
        this.modules = Object.values(modules);
    }
    /**
     * BUild the module list from module path.
     *
     * @param {string[]} moduleDataList
     * @returns {ModuleInterface[]}
     * @protected
     */
    getModulesFromConfig() {
        var _a;
        const moduleDataList = (_a = AppConfig_1.AppConfig.getConfig()) === null || _a === void 0 ? void 0 : _a.modules;
        const modulesList = [];
        if (moduleDataList && moduleDataList.length) {
            for (const moduleData of moduleDataList) {
                const modulePath = path_1.default.resolve(process.cwd(), moduleData.path);
                if (fs_1.default.existsSync(modulePath)) {
                    const ModuleClass = require(modulePath)[moduleData.id];
                    modulesList.push(new ModuleClass());
                }
            }
        }
        return modulesList;
    }
}
exports.ModuleFinder = new ModuleFinderClass();
