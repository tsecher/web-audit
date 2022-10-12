"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgs = void 0;
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
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
 * Return user args.
 *
 * @returns {{urls: URL[]}}
 */
function getArgs(required, logger) {
    const args = {
        urls: getUrlsArgs(),
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
}
exports.getArgs = getArgs;
