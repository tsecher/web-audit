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
exports.PageWrapper = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Puppeteer page wrapper provides page tools for journey.
 */
class PageWrapper {
    /**
     * Constructor
     *
     * @param name
     */
    constructor(name, logger) {
        this.name = name;
        this.logger = logger;
        this.rep = path_1.default.join(LogRep.rep(), `trace`, `screen`, this.name);
        this.options = {
            browserArgs: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process',], viewport: {
                width: 1920, height: 1080, isMobile: false,
            }, timeout: 180000,
        };
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
        });
    }
    /**
     * Create new page context.
     *
     * @param context
     * @returns {Promise<PageWrapper>}
     */
    newPage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`New page`);
            this.setContext(context);
            const browser = yield this.getBrowser();
            this.page = yield browser.newPage();
            yield this.page.setViewport(this.options.viewport);
            return this;
        });
    }
    /**
     * Go To url.
     *
     * @param url
     * @returns {Promise<PageWrapper>}
     */
    goto(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(url, `URL`);
            this.currentUrl = url;
            yield this.page.goto(this.currentUrl);
            return this;
        });
    }
    /**
     * Snap a session (image and html file).
     *
     * @param name
     * @returns {Promise<PageWrapper>}
     */
    snap(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.page) {
                this.step++;
                name = `${this.step}${name ? ` - ${name}` : ``}`;
                this.log(`${this.context}:${name}`, `Snap`);
                const screenPath = `${this.rep}/${this.context}`;
                fs_1.default.mkdirSync(screenPath, { recursive: true });
                // Create file.
                const body = yield this.page.evaluate(() => document.querySelector('html').outerHTML);
                fs_1.default.writeFileSync(`${screenPath}/${name}.html`, body, 'utf8');
                // Snapshot.
                yield this.page.screenshot({ path: `${screenPath}/${name}.png` });
            }
            return Promise.resolve(this);
        });
    }
    /**
     * Set log context.
     *
     * @param context
     */
    setContext(context) {
        this.context = context;
        this.step = 0;
    }
    /**
     * Log.
     *
     * @param data
     * @param id
     */
    log(data, id) {
        if (this.title !== this.context) {
            this.title = this.context;
            this.logger.log(`===================== ${this.context}`);
        }
        if (id) {
            this.logger.log(`=> ${id} :`);
        }
        this.logger.log(data);
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
                setTimeout(() => resolve(), timeout);
            });
        });
    }
    /**
     * Wait for selector to disappear.
     *
     * @param selector
     * @param timeout
     * @returns {Promise<unknown>}
     */
    waitForSelectorDisappear(selector, timeout = 60, pause = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let tries = timeout;
                let nb = 0;
                do {
                    nb = yield this.page.evaluate((selector) => document.querySelectorAll(selector).length, selector);
                    yield this.wait(pause);
                    tries--;
                } while (nb > 0 && tries > 0);
                resolve();
            }));
        });
    }
    /**
     * Return an element that contains text.
     *
     * @returns {Promise<void>}
     */
    getByText(xpath, text) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.page.$x(`//${xpath}[contains(., '${text}')]`);
        });
    }
}
exports.PageWrapper = PageWrapper;
