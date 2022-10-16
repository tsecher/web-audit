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
async function getUrlsArgs(required: boolean, logger: LoggerInterface): Promise<any> {
  let selected: URL[] = [];
  if (params.urls && typeof params.urls === 'string') {
    const urls = params.urls.split(',');
    selected = urls
      .map((url: any) => {
        try {
          return new URL(url);
        } catch (error) {
          return false;
        }
      })
      .filter((url: any) => url);
  }

  // Manual
  if (required && !selected.length) {
    let manual: any = {};
    let value: string;

    do {
      manual = await prompts([{
        type: 'text',
        name: 'urls',
        message: `URLs ? (leave empty to stop)`,
      }]);

      value = manual.urls;

      try {
        if (value.trim().length > 0) {
          selected.push(new URL(value));
        }
      } catch (error) {
        logger.error(`Bad URL format : ${value}`);
      }

    }
    while (value.trim().length > 0);
  }

  return {
    data: selected,
    shortcut: selected.length ? `--urls=${selected.map((url) => url.toString()).join()}` : '',
  };
}


/**
 * Return modules;
 *
 * @returns {ModuleInterface}
 */
async function getModules(required: boolean, logger: LoggerInterface): Promise<any> {
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

  return {
    data: selected,
    shortcut: selected.length ? `--modules=${selected.map((module) => module.id).join()}` : '',
  };
}

/**
 * Return user args.
 *
 * @returns {{urls: URL[]}}
 */
export async function getArgs(required: string[], logger: LoggerInterface) {

  const args: any = {
    urls: await getUrlsArgs(required.indexOf('urls') > -1, logger),
    modules: await getModules(required.indexOf('modules') > -1, logger),
  };

  logger.warning(`Shortcut: `);
  logger.warning(Object.values(args).map((value: any) => value.shortcut).join(' '));

  const result: any = {};
  Object.keys(args).forEach((key: any) => {
    result[key] = args[key].data;
  });

  return result;
}
