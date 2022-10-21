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
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const prompts = require('prompts');
const params = yargs(hideBin(process.argv)).argv;
/**
 * Return urls from args.
 *
 * @returns {URL[]}
 */
function getUrlsArgs(required, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        let selected = [];
        if (params.urls && typeof params.urls === 'string') {
            const urls = params.urls.split(',');
            selected = urls
                .map((url) => {
                try {
                    return new URL(url);
                }
                catch (error) {
                    return false;
                }
            })
                .filter((url) => url);
        }
        // Manual
        if (!selected.length) {
            let manual = {};
            let value = '';
            do {
                manual = yield prompts([{
                        type: 'text',
                        name: 'urls',
                        message: `URLs ? (leave empty to stop)`,
                    }]);
                value = manual.urls;
                try {
                    if (value.trim().length > 0) {
                        selected.push(new URL(value));
                    }
                }
                catch (error) {
                    logger.error(`Bad URL format : ${value}`);
                }
            } while (required && value.trim().length > 0); // eslint-disable-line no-unmodified-loop-condition
        }
        return {
            data: selected,
            shortcut: selected.length ? `--urls=${selected.map((url) => url.toString()).join()}` : '',
        };
    });
}
/**
 * Return modules;
 *
 * @returns {ModuleInterface}
 */
function getModules(required, logger) {
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
        return {
            data: selected,
            shortcut: selected.length ? `--modules=${selected.map((module) => module.id).join()}` : '',
        };
    });
}
/**
 * Return urls from args.
 *
 * @returns {URL[]}
 */
function getFilesArgs(required, logger) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let urlsData = yield getUrlsArgs(false, logger);
        if (required && !((_a = urlsData.data) === null || _a === void 0 ? void 0 : _a.length)) {
            let file = params.file || '';
            let answer = { file: file };
            while (!fs.existsSync(file) || path.extname(file) !== '.csv') {
                answer = yield prompts([{
                        type: 'text',
                        name: 'file',
                        message: `File path (relative to ${process.cwd()})`,
                    }]);
                file = path.resolve(process.cwd(), answer.file);
            }
            // read urls.
            const urls = fs.readFileSync(file, 'utf-8')
                .split('\n')
                .map((row) => {
                const cell = row.split(',')[0].trim();
                const value = cell[0] === '"' ? cell.slice(1, -1) : cell;
                try {
                    return new URL(value);
                }
                catch (error) {
                    return false;
                }
            })
                .filter((url) => url);
            urlsData = {
                data: urls,
                shortcut: `--file=${answer.file}`,
            };
        }
        return urlsData;
    });
}
/**
 * Version.
 *
 * @param {boolean} required
 * @param {LoggerInterface} logger
 * @returns {Promise<any>}
 */
function getVersionArgs(required, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        let version = params.v;
        if (required && !params.v) {
            const answer = yield prompts([{
                    type: 'text',
                    name: 'version',
                    message: `Version ?`,
                }]);
            const date = new Date();
            version = answer.version.length ? answer.version : `${date.getFullYear()}-${`0${date.getMonth() + 1}`.slice(-2)}-${`0${date.getDate()}`.slice(-2)}-${date.getHours()}-${date.getMinutes()}`;
        }
        return {
            data: version,
            shortcut: `--v=${version}`,
        };
    });
}
/**
 * Return user args.
 *
 * @returns {{urls: URL[]}}
 */
function getArgs(required, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = {};
        args.urls = required.indexOf('urls') > -1 ? yield getUrlsArgs(required.indexOf('urls') > -1, logger) : yield getFilesArgs(required.indexOf('urlsFiles') > -1, logger);
        args.version = yield getVersionArgs(required.indexOf('version') > -1, logger);
        args.modules = yield getModules(required.indexOf('modules') > -1, logger);
        logger.warning(`Shortcut: `);
        logger.warning(Object.values(args).map((value) => value.shortcut).join(' '));
        const result = {};
        Object.keys(args).forEach((key) => {
            result[key] = args[key].data;
        });
        return result;
    });
}
exports.getArgs = getArgs;
