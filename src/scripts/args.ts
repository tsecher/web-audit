import fs from 'fs';
import path from 'path';

// @ts-ignore
import yargs from 'yargs/yargs';
// @ts-ignore
import {hideBin} from 'yargs/helpers';
// @ts-ignore
import inquirer from 'inquirer';

import {LoggerInterface} from '##/loggers/Logger';
import {ModuleInterface} from '##/modules/ModuleInterface';
import {ModuleFinder} from '##/app/utils/AppModuleFinder';
import CSVStorage from '##/storage/csv/CSVStorage';
import {JourneyInterface} from '##/journey/JourneyInterface';
import {JourneyFinder} from '##/app/utils/AppJourneyFinder';
import {CrawlerFinder} from '##/app/utils/AppCrawlerFinder';
import {StorageFinder} from '##/app/utils/AppStorageFinder';
import {StorageInterface} from '##/storage/Storage';
import {LoggerFinder} from '##/app/utils/AppLoggerFinder';
import {AppConfig, AppConfigFileName} from "##/app/conf/AppConfig";


// import prompts from 'prompts';

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
            manual = await inquirer.prompt([{
                type: 'input',
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
    const allModules: ModuleInterface[] = await ModuleFinder.getModules();

    let selected: ModuleInterface[] = [];
    if (params.modules && typeof params.modules === 'string') {
        const names = params.modules.split(',');
        selected = allModules.filter((module) => names.indexOf(module.id) > -1);
    }

    // Manual
    if (required && !selected.length) {
        const manual = await inquirer.prompt([{
            type: 'checkbox',
            name: 'modules',
            message: `Modules ?`,
            default: allModules,
            choices: allModules.map((module) => {
                return {
                    name: module.name,
                    value: module,
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
            answer = await inquirer.prompt([{
                type: 'text',
                name: 'file',
                message: `File path (relative to ${process.cwd()})`,
            }]);

            file = path.resolve(process.cwd(), answer.file);
        }

        // read urls.
        const urls: URL[] = [];
        fs.readFileSync(file, 'utf-8')
            .split('\n')
            .forEach((row: string) => {
                const cell = row.split(CSVStorage.SEPARATOR)[0].trim();
                const value: string = cell[0] === '"' ? cell.slice(1, -1) : cell;

                try {
                    urls.push(new URL(value));
                } catch (error) {
                    // Mute error.
                }
            });

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

        const answer = await inquirer.prompt([{
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
 * Return modules;
 *
 * @returns {ModuleInterface}
 */
async function getJourney(required: boolean, logger: LoggerInterface): Promise<any> {
    const allJourneys: JourneyInterface[] = await JourneyFinder.getJourneys();

    let selected: JourneyInterface | null = null;
    if (params.journey && typeof params.journey === 'string') {
        selected = allJourneys.filter((journey) => params.journey === journey.id)[0];
    }

    // Manual
    if (required && !selected) {
        const manual = await inquirer.prompt([{
            type: 'list',
            name: 'journey',
            message: `Journey ?`,
            choices: allJourneys.map((journey) => {
                return {
                    name: journey.name,
                    value: journey,
                };
            }),
        }]);

        selected = manual.journey;
    }

    return {
        data: selected,
        shortcut: selected ? `--journey=${selected.id}` : '',
    };
}


/**
 * Return crawler;
 *
 * @returns {any}
 */
async function getCrawler(required: boolean, logger: LoggerInterface): Promise<any> {
    const allCrawlers: any[] = await CrawlerFinder.getCrawler();

    let selected: JourneyInterface | null = null;
    if (params.crawler && typeof params.crawler === 'string') {
        selected = allCrawlers.filter((crawler) => params.crawler === crawler.id)[0];
    }

    // Manual
    if (required && !selected) {
        const manual = await inquirer.prompt([{
            type: 'list',
            name: 'crawler',
            message: `Crawler ?`,
            choices: allCrawlers.map((crawler) => {
                return {
                    name: crawler.label,
                    value: crawler,
                };
            }),
        }]);

        selected = manual.crawler;
    }

    return {
        data: selected,
        shortcut: selected ? `--crawler=${selected.id}` : '',
    };
}


/**
 * Return storage;
 *
 * @returns {any}
 */
async function getStorage(required: boolean, logger: LoggerInterface): Promise<any> {
    const allStorages: any[] = await StorageFinder.getStorage();

    let selected: StorageInterface | null = null;
    if (params.storage && typeof params.storage === 'string') {
        selected = allStorages.filter((storage) => params.storage === storage.id)[0];
    }

    // Manual
    if (required && !selected) {
        const manual = await inquirer.prompt([{
            type: 'list',
            name: 'storage',
            message: `Storage ?`,
            choices: allStorages.map((storage) => {
                return {
                    name: storage.name,
                    value: storage,
                };
            }),
        }]);

        selected = manual.storage;
    }

    return {
        data: selected,
        shortcut: selected ? `--storage=${selected.id}` : '',
    };
}


/**
 * Return storage;
 *
 * @returns {any}
 */
async function getLogger(required: boolean): Promise<any> {
    const allLoggers: any[] = await LoggerFinder.getLogger();

    let selected: LoggerInterface | null = null;
    if (params.logger && typeof params.logger === 'string') {
        selected = allLoggers.filter((logger) => params.logger === logger.id)[0];
    }

    // Manual
    if (required && !selected) {
        const manual = await inquirer.prompt([{
            type: 'list',
            name: 'logger',
            message: `Logger ?`,
            choices: allLoggers.map((logger) => {
                return {
                    name: logger.name,
                    value: logger,
                };
            }),
        }]);

        selected = manual.logger;
    }

    return {
        data: selected,
        shortcut: selected ? `--logger=${selected.id}` : '',
    };
}

async function getConfig(required: boolean, logger: LoggerInterface): Promise<any> {

    let configFilePath: string = 'default';
    if (params.config && typeof params.config === 'string') {
        configFilePath = params.config
    }

    // Manual
    if (required && configFilePath !== 'default') {
        const answer = await inquirer.prompt([{
            type: 'text',
            name: 'config',
            message: `Config file path (relative to ${process.cwd()})`,
        }]);

        configFilePath = answer.config;
    }

    if (configFilePath === 'default') {
        configFilePath = AppConfigFileName
    }

    if (configFilePath.length && !fs.existsSync(configFilePath)) {
        return getConfig(required, logger);
    }

    if (configFilePath.length) {
        // Init conf.
        const confFile = await import(path.join(process.cwd(), configFilePath));
        const conf = confFile.config;
        AppConfig.addConfig(conf);
    }

    return {
        data: AppConfig.getConfig(),
        shortcut: `--config=${configFilePath}`,
    };
}

/**
 * Return user args.
 *
 * @returns {{urls: URL[]}}
 */
export async function getArgs(required: string[]) {

    const loggerData = await getLogger(true);
    const logger: LoggerInterface = loggerData.data;


    const args: any = {};
    args.config = await getConfig(true, logger);
    args.urls = required.indexOf('urls') > -1 ? await getUrlsArgs(required.indexOf('urls') > -1, logger) : await getFilesArgs(required.indexOf('urlsFiles') > -1, logger);
    args.version = await getVersionArgs(required.indexOf('version') > -1, logger);
    args.modules = await getModules(required.indexOf('modules') > -1, logger);
    args.journey = await getJourney(required.indexOf('journey') > -1, logger);
    args.crawler = await getCrawler(required.indexOf('crawler') > -1, logger);
    args.storage = await getStorage(required.indexOf('storage') > -1, logger);
    args.logger = loggerData;


    logger.warning(`Shortcut: `);
    logger.warning(Object.values(args).map((value: any) => value.shortcut).join(' '));

    const result: any = {};
    Object.keys(args).forEach((key: any) => {
        result[key] = args[key].data;
    });

    return result;
}
