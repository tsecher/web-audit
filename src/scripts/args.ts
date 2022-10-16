import {LoggerInterface} from '../loggers/Logger';
import {ModuleInterface} from '../modules/ModuleInterface';
import {EcoIndexModule} from '../modules/ecoindex/EcoIndexModule';
import {LighthouseModule} from '../modules/lighthouse/LighthouseModule';

const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const prompts = require('prompts');

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
 * Return modules;
 *
 * @returns {ModuleInterface}
 */
async function getModules(required: boolean): Promise<ModuleInterface[]> {
  const allModules: ModuleInterface[] = [
    new EcoIndexModule(),
    new LighthouseModule(),
  ];

  let selected: ModuleInterface[] = [];
  if (params.modules && typeof params.modules === 'string') {
    const names = params.modules.split(',');
    selected = allModules.filter((module) => names.indexOf(module.id) > -1);
  }

  // Manual
  if (required && !selected.length) {
    const manual = await prompts([{
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
}

/**
 * Return user args.
 *
 * @returns {{urls: URL[]}}
 */
export async function getArgs(required: string[], logger: LoggerInterface) {
  const args: any = {
    urls: getUrlsArgs(),
    modules: await getModules(required.indexOf('modules') > -1),
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
