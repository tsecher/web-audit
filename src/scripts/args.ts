import {LoggerInterface} from '../loggers/Logger';

const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');

const params: any = yargs(hideBin(process.argv)).argv;

/**
 * Return urls from args.
 *
 * @returns {URL[]}
 */
function getUrlsArgs(): URL[] {
  if (!params.urls) {
    return [];
  }

  return params.urls
    .split(',')
    .map((url: string) => {
      try {
        return new URL(url);
      } catch (error) {
        return null;
      }
    })
    .filter((url: any) => url);
}

/**
 * Return user args.
 *
 * @returns {{urls: URL[]}}
 */
export function getArgs(required: string[], logger: LoggerInterface) {
  const args: any = {
    urls: getUrlsArgs(),
  };

  required.forEach((item: any) => {
    if (typeof args[item] === 'undefined') {
      logger.exit(`${item} is required. Please use parameter --${item}=...`);
    } else if (Array.isArray(args[item]) && !args[item].length) {
      logger.exit(`${item} is required. Please use parameter --${item}=arg1,arg2`);
    }
  });

  return args;
}
