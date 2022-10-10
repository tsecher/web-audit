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
exports.EcoIndexModule = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class EcoIndexModule {
    constructor(userOptions) {
        this.defaultOptions = {
            browserArgs: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            viewport: {
                width: 1920,
                height: 1080,
                isMobile: false,
            },
            timeout: 180000,
        };
        this.options = Object.assign(Object.assign({}, this.defaultOptions), userOptions);
    }
    get name() {
        return 'Eco Index';
    }
    /**
     * {@inheritdoc}
     */
    init(config, context) {
        this.config = config;
        this.context = context;
    }
    /**
     * {@inheritdoc}
     */
    analyse(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield this.getBrowser();
            const page = this.getPage(browser, url);
        });
    }
    /**
     * Return browser.
     *
     * @returns {Promise<any>}
     */
    getBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                return new Promise((resolve) => resolve(this.browser));
            }
            return puppeteer_1.default.launch({
                headless: true,
                args: this.options.browserArgs,
                pipe: true,
                ignoreDefaultArgs: [
                    '--disable-gpu',
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--no-first-run',
                    '--no-sandbox',
                    '--no-zygote',
                    '--single-process',
                ],
            });
        });
    }
    getPage(browser, url) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.config) === null || _a === void 0 ? void 0 : _a.logger.message('0');
            const page = yield browser.newPage();
            (_b = this.config) === null || _b === void 0 ? void 0 : _b.logger.message('1');
            yield page.setViewport(this.options.viewport);
            (_c = this.config) === null || _c === void 0 ? void 0 : _c.logger.message('2');
            yield page.setCacheEnabled(false);
            (_d = this.config) === null || _d === void 0 ? void 0 : _d.logger.message('3');
            try {
                (_e = this.config) === null || _e === void 0 ? void 0 : _e.logger.message('Try');
                yield page.goto(url.toString(), { timeout: this.options.timeout });
            }
            finally {
                (_f = this.config) === null || _f === void 0 ? void 0 : _f.logger.message('ok');
            }
        });
    }
}
exports.EcoIndexModule = EcoIndexModule;
