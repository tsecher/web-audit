import {LoggerInterface} from '../loggers/Logger';
import {ModuleInterface} from '../modules/ModuleInterface';
import {ModuleFinder} from '../app/utils/AppModuleFinder';

const fs = require('fs');
const path = require('path');

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
  if (!selected.length) {
    let manual: any = {};
    let value = '';

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
    while (required && value.trim().length > 0); // eslint-disable-line no-unmodified-loop-condition
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
  const allModules: ModuleInterface[] = ModuleFinder.getModules();

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
 * Return urls from args.
 *
 * @returns {URL[]}
 */
async function getFilesArgs(required: boolean, logger: LoggerInterface): Promise<any> {
  let urlsData: any = await getUrlsArgs(false, logger);

  if (required && !urlsData.data?.length) {

    let file = params.file || '';
    let answer: any = {file: file};
    while (!fs.existsSync(file) || path.extname(file) !== '.csv') {
      answer = await prompts([{
        type: 'text',
        name: 'file',
        message: `File path (relative to ${process.cwd()})`,
      }]);

      file = path.resolve(process.cwd(), answer.file);
    }

    // read urls.
    const urls: URL[] = fs.readFileSync(file, 'utf-8')
      .split('\n')
      .map((row: string) => {
        const cell = row.split(',')[0].trim();
        const value: string = cell[0] === '"' ? cell.slice(1, -1) : cell;

        try {
          return new URL(value);
        } catch (error) {
          return false;
        }
      })
      .filter((url: URL) => url);

    urlsData = {
      data: urls,
      shortcut: `--file=${answer.file}`,
    };
  }

  return urlsData;
}

/**
 * Version.
 *
 * @param {boolean} required
 * @param {LoggerInterface} logger
 * @returns {Promise<any>}
 */
async function getVersionArgs(required: boolean, logger: LoggerInterface): Promise<any> {
  let version = params.v;

  if (required && !params.v) {

    const answer = await prompts([{
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
}

/**
 * Return user args.
 *
 * @returns {{urls: URL[]}}
 */
export async function getArgs(required: string[], logger: LoggerInterface) {

  const args: any = {};

  args.urls = required.indexOf('urls') > -1 ? await getUrlsArgs(required.indexOf('urls') > -1, logger) : await getFilesArgs(required.indexOf('urlsFiles') > -1, logger);
  args.version = await getVersionArgs(required.indexOf('version') > -1, logger);
  args.modules = await getModules(required.indexOf('modules') > -1, logger);

  logger.warning(`Shortcut: `);
  logger.warning(Object.values(args).map((value: any) => value.shortcut).join(' '));

  const result: any = {};
  Object.keys(args).forEach((key: any) => {
    result[key] = args[key].data;
  });

  return result;
}
