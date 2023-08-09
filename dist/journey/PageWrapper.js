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
exports.PageWrapper = exports.DEFAULT_OPTIONS = void 0;
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const puppeteer_autoscroll_down_1 = require("puppeteer-autoscroll-down");
/**
 * Default Options for page wrapper.
 *
 * @type {{browserArgs: string[], viewport: {width: number, isMobile: boolean, height: number}, timeout: number}}
 */
exports.DEFAULT_OPTIONS = {
    browserArgs: [
        '--no-sandbox',
    ],
    viewport: {
        width: 1920, height: 1080, isMobile: false,
    },
    timeout: 180000,
};
/**
 * Puppeteer page wrapper provides page tools for journey.
 */
class PageWrapper {
    /**
     * Constructor
     *
     * @param context
     * @param options
     */
    constructor(context, options = {}) {
        this.context = context;
        /**
         * Current options.
         *
         * @type {{}}
         */
        this.options = {};
        this.step = 0;
        // Build dependencies.
        this.options = Object.assign(Object.assign({}, exports.DEFAULT_OPTIONS), options);
    }
    /**
     * Get browser and init it if not set yet.
     * @returns {Promise<Browser>}
     */
    getBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                this.browser = yield puppeteer_1.default.launch({
                    headless: true,
                    args: this.options.browserArgs,
                    ignoreHTTPSErrors: true,
                    ignoreDefaultArgs: ['--disable-gpu'],
                });
            }
            return Promise.resolve(this.browser);
        });
    }
    /**
     * Close browser session.
     *
     * @returns {Promise<PageWrapper>}
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                yield this.browser.close();
                return this;
            }
            return Promise.resolve(this);
        });
    }
    /**
     * Create new page context.
     *
     * @returns {Promise<PageWrapper>}
     */
    newPage() {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield this.getBrowser();
            this._page = yield browser.newPage();
            yield this._page.setViewport(this.options.viewport);
            return this;
        });
    }
    /**
     * Go To url.
     *
     * @param url
     * @param nextOnError
     * @returns {Promise<PageWrapper>}
     */
    goto(url, nextOnError = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (nextOnError) {
                try {
                    yield this._page.goto(url);
                }
                catch (err) {
                    this.context.config.logger.error(err);
                }
            }
            else {
                yield this._page.goto(url);
            }
            return this;
        });
    }
    /**
     * Snap a session (image and html file).
     *
     * @param name
     * @param screenPath
     * @returns {Promise<PageWrapper>}
     */
    snap(name, screenPath = 'screenshots') {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this._page) {
                this.step++;
                const steppedName = `${this.step}${name ? ` - ${name}` : ``}`;
                fs_1.default.mkdirSync(screenPath, { recursive: true });
                // Create file.
                const body = yield this.page.evaluate(() => { var _a; return (_a = document === null || document === void 0 ? void 0 : document.querySelector('html')) === null || _a === void 0 ? void 0 : _a.outerHTML; });
                fs_1.default.writeFileSync(`${screenPath}/${steppedName}.html`, body, 'utf8');
                (_a = this.context.config.storage) === null || _a === void 0 ? void 0 : _a.file(`${screenPath}/${steppedName}.html`, this.context);
                // Snapshot.
                yield this.page.screenshot({ path: `${screenPath}/${steppedName}.png` });
                (_b = this.context.config.storage) === null || _b === void 0 ? void 0 : _b.file(`${screenPath}/${steppedName}.png`, this.context);
            }
            return Promise.resolve(this);
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
                setTimeout(() => resolve(this), timeout);
            });
        });
    }
    /**
     * Scroll to bottom of the page.
     *
     * @returns {Promise<void>}
     */
    scrollToBottom() {
        return __awaiter(this, void 0, void 0, function* () {
            const bodyHeight = yield this._page.evaluate(() => document.body.clientHeight);
            const windowHeight = yield this._page.evaluate(() => window.innerHeight);
            let steps = Math.floor(bodyHeight / windowHeight);
            let size = windowHeight;
            if (steps > 10) {
                steps = 10;
                size = bodyHeight / 10;
            }
            for (let i = 0; i < steps + 2; i++) {
                yield (0, puppeteer_autoscroll_down_1.scrollPageToBottom)(this._page, {
                    size: size,
                    delay: 200,
                });
            }
        });
    }
    get page() {
        return this._page;
    }
}
exports.PageWrapper = PageWrapper;
