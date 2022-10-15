import fs from 'fs';
import path from 'path';

import puppeteer from 'puppeteer';

import {ModuleInterface} from '../ModuleInterface';
import {WebAuditConfigClass as Config} from '../../core/WebAuditConfig';
import {WebAuditContextClass as Context} from '../../core/WebAuditContext';
import {WebAuditEvent as Event} from '../../core/WebAuditEvent';

import {analyseURL} from './Page';

export const EcoIndexModuleEvents: any = {
  createEcoIndexModule: 'ecoindex_module__createEcoIndexModule',
  beforeAnalyse: 'ecoindex_module__beforeAnalyse',
  onResult: 'ecoindex_module__onResult',
  onBrowserClose: 'ecoindex_module__onBrowserClose',
  onBrowserLaunch: 'ecoindex_module__onBrowserLaunch',
  onNewPage: 'ecoindex_module__onNewPage',
  afterAnalyse: 'ecoindex_module__afterAnalyse',
};

export class EcoIndexModule implements ModuleInterface {

  get name(): string {
    return 'Eco Index';
  }

  private options: any;

  private browser: any;

  private config?: Config;

  private context?: Context;

  private compiledScriptPath?: string;

  private defaultOptions = {
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--single-process',
    ],
    viewport: {
      width: 1920,
      height: 1080,
      isMobile: false,
    },
    timeout: 180000,
  };

  constructor(
    userOptions: any = {},
  ) {
    // Build dependencies.
    this.options = {
      ...this.defaultOptions,
      ...userOptions,
    };
  }

  /**
   * {@inheritdoc}
   */
  async init(config: Config, context: Context): Promise<any> {
    this.config = config;
    this.context = context;

    this.compiledScriptPath = this.getGreenITCompiledScript();

    // Install eco index store.
    this.config.storage?.installStore('ecoindex', this.context, {
      url: 'Url',
      grade: 'Grade',
      ecoIndex: 'Ecoindex',
      domSize: 'Dom Size',
      nbRequest: 'NB request',
      responsesSize: 'Responses Size',
      responsesSizeUncompress: 'Responses Size Uncompress',
      waterConsumption: 'Water consumption',
      greenhouseGasesEmission: 'Greenhouse Gases Emission',
      nbBestPracticesToCorrect: 'Nb Best practices to correct',
    });

    // Install eco index best_practices.
    this.config.storage?.installStore('ecoindex_best_practices', this.context, {
      url: 'Url',
      id: 'ID',
      comment: 'Message',
      complianceLevel: 'Compliance level',
      detailComment: 'Detail',
    });

    // Emit.
    Event.emit(EcoIndexModuleEvents.createEcoIndexModule, {module: this});
  }

  /**
   * {@inheritdoc}
   */
  async analyse(url: URL): Promise<any> {
    Event.emit(EcoIndexModuleEvents.beforeAnalyse, {module: this});

    const browser = await this.getBrowser();

    const result: any = await this.getAnalysisResult(browser, url);
    result.url = url.toString();
    Event.emit(EcoIndexModuleEvents.onResult, {module: this, url: url, browser: this.browser, result: result});

    this.storeResult(result);

    if (result?.success) {
      this.config?.logger.success(`Ecoindex : ${result.grade} (${result.ecoIndex}) `, url.toString());
    } else {
      this.config?.logger.error(`Could not analyse page`);
    }

    Event.emit(EcoIndexModuleEvents.afterAnalyse, {module: this, url: url, result: result});

    return result?.success || false;
  }

  /**
   * Finish analyse process.
   *
   * @returns {Promise<any>}
   */
  async finish(): Promise<any> {
    const browser = await this.getBrowser();
    await browser?.close();
    Event.emit(EcoIndexModuleEvents.onBrowserClose, {module: this, browser: this.browser});
  }


  /**
   * Return browser.
   *
   * @returns {Promise<any>}
   */
  private async getBrowser(): Promise<any> {
    if (this.browser) {
      return new Promise((resolve) => resolve(this.browser));
    }

    // Launch browser.
    this.config?.logger.message('First, launch browser');
    this.browser = await puppeteer.launch({
      headless: true,
      args: this.options.browserArgs,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: [
        '--disable-gpu',
      ],
    });

    Event.emit(EcoIndexModuleEvents.onBrowserLaunch, {module: this, browser: this.browser});

    return this.browser;
  }

  /**
   * Get page.
   *
   * @param browser
   * @param {URL} url
   * @returns {Promise<void>}
   * @private
   */
  private async getAnalysisResult(browser: any, url: URL) {
    // Init page configuration.
    const page = await browser.newPage();
    await page.setViewport(this.options.viewport);
    await page.setCacheEnabled(false);

    Event.emit(EcoIndexModuleEvents.onNewPage, {module: this, browser: browser, page: page, url: url});

    const result: any = await analyseURL(page, url.toString(), this.options, this.compiledScriptPath);
    return result;
  }

  /**
   * Create a concatained script from
   * @private
   */
  private getGreenITCompiledScript() {
    const destinationFile: string = path.resolve(__dirname, '../../../dist/modules/ecoindex/scripts/ecoindex-core.js');

    if (!fs.existsSync(destinationFile)) {
      this.compileGreenITScript(destinationFile);
    }

    return destinationFile;
  }

  /**
   * Compile green IT scripts that will be added to the audited page.
   *
   * @param {string} destinationFile
   * @private
   */
  private compileGreenITScript(destinationFile: string) {
    // Create directory;
    fs.mkdirSync(path.dirname(destinationFile), {recursive: true});

    // Concat green it core files.
    const concat: any = require('concat-files');
    const glob: any = require('glob');
    const rulesDirPath = path.resolve(
      path.dirname(require.resolve('greenit-cli/greenit-core/analyseFrameCore')),
      'rules',
    );
    const rules = glob.sync(`${rulesDirPath}/*.js`);

    // GreenIT-Analysis concatanation.
    concat(
      [
        require.resolve('greenit-cli/greenit-core/analyseFrameCore'),
        require.resolve('greenit-cli/greenit-core/utils'),
        require.resolve('greenit-cli/greenit-core/rulesManager'),
        require.resolve('greenit-cli/greenit-core/ecoIndex'),
        ...rules,
        require.resolve('greenit-cli/greenit-core/greenpanel'),
      ],
      destinationFile,
      (err?: any) => {
        if (err) {
          this.config?.logger.error(`Error trying to execute Green IT Analyse compilation`);
          this.config?.logger.exit(err);
        }
      },
    );
  }

  private storeResult(result: any) {
    this.config?.storage?.add('ecoindex', this.context, result);

    if (result.bestPractices) {
      Object.keys(result.bestPractices).forEach((bestPracticeId) => {
        const compliance: string = result.bestPractices[bestPracticeId]?.complianceLevel || 'A';
        if (compliance && compliance !== 'A') {
          this.config?.storage?.add('ecoindex_best_practices', this.context, {
            ...{
              url: result.url,
              id: bestPracticeId,
            },
            ...result.bestPractices[bestPracticeId],
          });
        }
      });
    }
  }

}
