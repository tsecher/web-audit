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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcoIndex2Module = exports.EcoIndex2ModuleEvents = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const ModuleInterface_1 = require("../ModuleInterface");
const WebAuditEvent_1 = require("../../core/WebAuditEvent");
const analyseURL = require('./Page').analyseURL;
exports.EcoIndex2ModuleEvents = {
    createEcoIndexModule: 'ecoindex_module__createEcoIndexModule',
    beforeAnalyse: 'ecoindex_module__beforeAnalyse',
    onResult: 'ecoindex_module__onResult',
    onBrowserClose: 'ecoindex_module__onBrowserClose',
    onBrowserLaunch: 'ecoindex_module__onBrowserLaunch',
    onNewPage: 'ecoindex_module__onNewPage',
    afterAnalyse: 'ecoindex_module__afterAnalyse',
};
class EcoIndex2Module {
    constructor(userOptions = {}) {
        this.defaultOptions = {
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
            bestPracticesAnalyse: true,
        };
        // Build dependencies.
        this.options = Object.assign(Object.assign({}, this.defaultOptions), userOptions);
    }
    get name() {
        return 'Eco Index';
    }
    get id() {
        return `ecoindex`;
    }
    /**
     * {@inheritdoc}
     */
    init(config, context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.config = config;
            this.context = context;
            this.compiledScriptPath = this.getGreenITCompiledScript();
            // Install eco index store.
            (_a = this.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('ecoindex', this.context, {
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
            (_b = this.config.storage) === null || _b === void 0 ? void 0 : _b.installStore('ecoindex_best_practices', this.context, {
                url: 'Url',
                id: 'ID',
                comment: 'Message',
                complianceLevel: 'Compliance level',
                detailComment: 'Detail',
            });
            // Emit.
            WebAuditEvent_1.WebAuditEvent.emit(EcoIndexModuleEvents.createEcoIndexModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            WebAuditEvent_1.WebAuditEvent.emit(EcoIndexModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            const browser = yield this.getBrowser();
            const result = yield this.getAnalysisResult(browser, urlWrapper);
            result.url = urlWrapper.url.toString();
            WebAuditEvent_1.WebAuditEvent.emit(EcoIndexModuleEvents.onResult, { module: this, url: urlWrapper, browser: this.browser, result: result });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.afterAnalyse, { module: this, url: urlWrapper, result: result });
            this.storeResult(result);
            if (result === null || result === void 0 ? void 0 : result.success) {
                (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.success(`Ecoindex : ${result.grade} (${result.ecoIndex}) `, urlWrapper.url.toString());
            }
            else {
                (_b = this.config) === null || _b === void 0 ? void 0 : _b.logger.error(`Could not analyse page`);
            }
            WebAuditEvent_1.WebAuditEvent.emit(EcoIndexModuleEvents.afterAnalyse, { module: this, url: urlWrapper, result: result });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.afterAnalyse, { module: this, url: urlWrapper });
            return (result === null || result === void 0 ? void 0 : result.success) || false;
        });
    }
    /**
     * Finish analyse process.
     *
     * @returns {Promise<any>}
     */
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield this.getBrowser();
            yield (browser === null || browser === void 0 ? void 0 : browser.close());
            WebAuditEvent_1.WebAuditEvent.emit(EcoIndexModuleEvents.onBrowserClose, { module: this, browser: this.browser });
        });
    }
    /**
     * Return browser.
     *
     * @returns {Promise<any>}
     */
    getBrowser() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                return new Promise((resolve) => resolve(this.browser));
            }
            // Launch browser.
            (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.message('First, launch browser');
            this.browser = yield puppeteer_1.default.launch({
                headless: true,
                args: this.options.browserArgs,
                ignoreHTTPSErrors: true,
                ignoreDefaultArgs: [
                    '--disable-gpu',
                ],
            });
            WebAuditEvent_1.WebAuditEvent.emit(EcoIndexModuleEvents.onBrowserLaunch, { module: this, browser: this.browser });
            return this.browser;
        });
    }
    /**
     * Get page.
     *
     * @param browser
     * @param {URL} urlWrapper
     * @returns {Promise<void>}
     * @private
     */
    getAnalysisResult(browser, urlWrapper) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Init page configuration.
            const page = yield browser.newPage();
            yield page.setViewport(this.options.viewport);
            yield page.setCacheEnabled(false);
            WebAuditEvent_1.WebAuditEvent.emit(EcoIndexModuleEvents.onNewPage, { module: this, browser: browser, page: page, url: urlWrapper });
            const result = yield analyseURL(page, urlWrapper.url.toString(), this.options, this.compiledScriptPath, (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger);
            return result;
        });
    }
    /**
     * Create a concatained script from
     * @private
     */
    getGreenITCompiledScript() {
        const destinationFile = path_1.default.resolve(__dirname, '../../../dist/modules/ecoindex/scripts/ecoindex-core.js');
        if (!fs_1.default.existsSync(destinationFile)) {
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
    compileGreenITScript(destinationFile) {
        // Create directory;
        fs_1.default.mkdirSync(path_1.default.dirname(destinationFile), { recursive: true });
        // Concat green it core files.
        const concat = require('concat-files');
        const glob = require('glob');
        const rulesDirPath = path_1.default.resolve(path_1.default.dirname(require.resolve('greenit-cli/greenit-core/analyseFrameCore')), 'rules');
        const rules = glob.sync(`${rulesDirPath}/*.js`);
        // GreenIT-Analysis concatanation.
        concat([
            require.resolve('greenit-cli/greenit-core/analyseFrameCore'),
            require.resolve('greenit-cli/greenit-core/utils'),
            require.resolve('greenit-cli/greenit-core/rulesManager'),
            require.resolve('greenit-cli/greenit-core/ecoIndex'),
            ...rules,
            require.resolve('greenit-cli/greenit-core/greenpanel'),
        ], destinationFile, (err) => {
            var _a, _b;
            if (err) {
                (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.error(`Error trying to execute Green IT Analyse compilation`);
                (_b = this.config) === null || _b === void 0 ? void 0 : _b.logger.exit(err);
            }
        });
    }
    storeResult(result) {
        var _a, _b;
        (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.add('ecoindex', this.context, result);
        if (result.bestPractices) {
            Object.keys(result.bestPractices).forEach((bestPracticeId) => {
                var _a, _b, _c;
                const compliance = ((_a = result.bestPractices[bestPracticeId]) === null || _a === void 0 ? void 0 : _a.complianceLevel) || 'A';
                if (compliance && compliance !== 'A') {
                    (_c = (_b = this.config) === null || _b === void 0 ? void 0 : _b.storage) === null || _c === void 0 ? void 0 : _c.add('ecoindex_best_practices', this.context, Object.assign({
                        url: result.url,
                        id: bestPracticeId,
                    }, result.bestPractices[bestPracticeId]));
                }
            });
        }
    }
}
exports.EcoIndex2Module = EcoIndex2Module;
