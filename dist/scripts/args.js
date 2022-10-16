"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgs = void 0;
const EcoIndexModule_1 = require("../modules/ecoindex/EcoIndexModule");
const LighthouseModule_1 = require("../modules/lighthouse/LighthouseModule");
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const prompts = require('prompts');
const params = yargs(hideBin(process.argv)).argv;
/**
 * Return urls from args.
 *
 * @returns {URL[]}
 */
function getUrlsArgs() {
    if (!params.urls) {
        return [];
    }
    return params.urls
        .split(',')
        .map((url) => {
        try {
            return new URL(url);
        }
        catch (error) {
            return null;
        }
    })
        .filter((url) => url);
}
/**
 * Return modules;
 *
 * @returns {ModuleInterface}
 */
function getModules(required) {
    return __awaiter(this, void 0, void 0, function* () {
        const allModules = [
            new EcoIndexModule_1.EcoIndexModule(),
            new LighthouseModule_1.LighthouseModule(),
        ];
        let selected = [];
        if (params.modules && typeof params.modules === 'string') {
            const names = params.modules.split(',');
            selected = allModules.filter((module) => names.indexOf(module.id) > -1);
        }
        // Manual
        if (required && !selected.length) {
            const manual = yield prompts([{
                    type: 'multiselect',
                    name: 'modules',
                    message: `Modules ?`,
                    choices: allModules.map((module) => {
                        return {
                            title: module.name,
                            value: module,
                            selected: true,
                        };
                    }),
                }]);
            selected = manual.modules;
        }
        return selected;
    });
}
/**
 * Return user args.
 *
 * @returns {{urls: URL[]}}
 */
function getArgs(required, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = {
            urls: getUrlsArgs(),
            modules: yield getModules(required.indexOf('modules') > -1),
        };
        required.forEach((item) => {
            if (typeof args[item] === 'undefined') {
                logger.exit(`${item} is required. Please use parameter --${item}=...`);
            }
            else if (Array.isArray(args[item]) && !args[item].length) {
                logger.exit(`${item} is required. Please use parameter --${item}=arg1,arg2`);
            }
        });
        return args;
    });
}
exports.getArgs = getArgs;
