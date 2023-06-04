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
exports.CPUModuleOld = exports.CPUModuleEvents = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const puppeteer_autoscroll_down_1 = require("puppeteer-autoscroll-down");
const ModuleInterface_1 = require("../ModuleInterface");
const WebAuditEvent_1 = require("../../core/WebAuditEvent");
const os = require('os-utils');
exports.CPUModuleEvents = {
    createCPUModule: 'cpu__createCPUModule',
    beforeAnalyse: 'cpu__beforeAnalyse',
    onResult: 'cpu__onResult',
    onBrowserClose: 'cpu__onBrowserClose',
    onBrowserLaunch: 'cpu__onBrowserLaunch',
    onNewPage: 'cpu__onNewPage',
    afterAnalyse: 'cpu__afterAnalyse',
};
class CPUModuleOld {
    constructor(userOptions = {}) {
        this.stock = [];
        this.currentStep = 0;
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
            pause: 2000,
        };
        // Build dependencies.
        this.options = Object.assign(Object.assign({}, this.defaultOptions), userOptions);
    }
    get name() {
        return 'CPU';
    }
    get id() {
        return `cpu`;
    }
    /**
     * {@inheritdoc}
     */
    init(config, context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.config = config;
            this.context = context;
            // Install eco index store.
            (_a = this.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('cpu', this.context, {
                url: 'Url',
                time: 'Time',
                cpu: 'CPU use average (%)',
                noiselessCPU: 'Noiseless CPU use average (%)',
            });
            // Install eco index best_practices.
            (_b = this.config.storage) === null || _b === void 0 ? void 0 : _b.installStore('cpu_history', this.context, {
                url: 'Url',
                time: 'Time',
                step: 'Step',
                cpu: 'CPU usage (%)',
                noiselessCPU: 'Noiseless CPU usage (%)',
            });
            // Emit.
            WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.createCPUModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.beforeAnalyse, { module: this, url: urlWrapper });
            const browser = yield this.getBrowser();
            const result = yield this.getAnalysisResult(browser, urlWrapper);
            WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.onResult, { module: this, url: urlWrapper, browser: this.browser, result: result });
            WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.afterAnalyse, { module: this, url: urlWrapper, result: result });
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
            WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.onBrowserClose, { module: this, browser: this.browser });
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
            WebAuditEvent_1.WebAuditEvent.emit(exports.CPUModuleEvents.onBrowserLaunch, { module: this, browser: this.browser });
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
        return __awaiter(this, void 0, void 0, function* () {
            // Init page configuration.
            const page = yield browser.newPage();
            yield page.setViewport(this.options.viewport);
            yield page.setCacheEnabled(false);
            // Define current delta usage to get only page CPU usage.
            this.noiseAverage = 0;
            this.startTimer();
            yield this.wait(2000);
            this.stopTimer();
            this.noiseAverage = this.getAverageData().cpu;
            this.stock = [];
            this.currentStep = 0;
            this.startTimer();
            this.currentStep++;
            yield this.wait(this.options.pause);
            this.currentStep++;
            yield page.goto(urlWrapper.url);
            this.currentStep++;
            yield this.wait(this.options.pause);
            this.currentStep++;
            yield this.scrollToBottom(page);
            this.currentStep++;
            yield this.wait(this.options.pause);
            this.stopTimer();
            return this.getResult(urlWrapper);
        });
    }
    /**
     * Scroll to bottom of the page.
     *
     * @param page
     * @returns {Promise<void>}
     */
    scrollToBottom(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const bodyHeight = yield page.evaluate(() => document.body.clientHeight);
            const windowHeight = yield page.evaluate(() => window.innerHeight);
            for (let i = 0; i < Math.floor(bodyHeight / windowHeight) + 2; i++) {
                yield (0, puppeteer_autoscroll_down_1.scrollPageToBottom)(page, {
                    size: windowHeight,
                    delay: 200,
                });
            }
        });
    }
    /**
     * Wait timeout.
     *
     * @param timeout
     * @returns {Promise<unknown>}
     */
    wait(timeout = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(() => resolve(null), timeout);
            });
        });
    }
    /**
     * Init timer
     */
    startTimer() {
        const firstTime = new Date().getTime();
        this.interval = setInterval(() => {
            const usage = {
                time: (new Date().getTime() - firstTime) / 1000,
                step: this.currentStep,
            };
            os.cpuUsage((value) => {
                const cpu = value * 100;
                usage.cpu = cpu;
                usage.noiselessCPU = cpu - this.noiseAverage;
            });
            this.stock.push(usage);
        }, 100);
    }
    /**
     * Stop timer.
     */
    stopTimer() {
        clearInterval(this.interval);
    }
    /**
     * Return the result.
     *
     * @param {UrlWrapper} urlWrapper
     * @returns {any}
     * @private
     */
    getResult(urlWrapper) {
        var _a, _b;
        this.stock.forEach((item) => {
            var _a, _b;
            (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.add('cpu_history', this.context, Object.assign(Object.assign({}, item), {
                url: urlWrapper.url,
            }));
        });
        // Average.
        const averageData = Object.assign(Object.assign({}, this.getAverageData()), {
            url: urlWrapper.url,
        });
        (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.add('cpu', this.context, averageData);
        return averageData;
    }
    /**
     * Return average data.
     *
     * @returns {{noiselessCPU: number, cpu: number, time: any}}
     * @private
     */
    getAverageData() {
        return {
            time: this.stock.at(-1).time,
            cpu: this.stock.reduce((sum, currentValue) => sum + (currentValue.cpu || 0), 0) / this.stock.length,
            noiselessCPU: this.stock.reduce((sum, currentValue) => sum + (currentValue.noiselessCPU || 0), 0) / this.stock.length,
        };
    }
}
exports.CPUModuleOld = CPUModuleOld;
