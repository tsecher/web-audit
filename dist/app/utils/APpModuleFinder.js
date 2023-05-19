"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleFinder = void 0;
const fs_1 = __importDefault(require("fs"));
class ModuleFinderClass {
    getModules(conf) {
        file;
        if (!this.modules) {
            if (fs_1.default.existsSync())
                ;
        }
    }
    getDefaultModules() {
    }
}
exports.ModuleFinder = new ModuleFinderClass();
