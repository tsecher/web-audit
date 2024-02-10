import fs from 'fs';
import puppeteer from 'puppeteer';
import { scrollPageToBottom } from 'puppeteer-autoscroll-down';
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
];
/**
 * Default Options for page wrapper.
 *
 * @type {{browserArgs: string[], viewport: {width: number, isMobile: boolean, height: number}, timeout: number}}
 */
export const DEFAULT_OPTIONS = {
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
export class PageWrapper {
    context;
    /**
     * Current options.
     *
     * @type {{}}
     */
    options = {};
    /**
     * The browser.
     *
     * @type {any}
     * @private
     */
    browser;
    /**
     * The page.
     *
     * @type {any}
     * @private
     */
    _page;
    step = 0;
    /**
     * Constructor
     *
     * @param context
     * @param options
     */
    constructor(context, options = {}) {
        this.context = context;
        // Build dependencies.
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };
    }
    /**
     * Get browser and init it if not set yet.
     * @returns {Promise<Browser>}
     */
    async getBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: this.options.browserArgs,
                ignoreHTTPSErrors: true,
                ignoreDefaultArgs: ['--disable-gpu', '--enable-automation'],
            });
        }
        return Promise.resolve(this.browser);
    }
    /**
     * Close browser session.
     *
     * @returns {Promise<PageWrapper>}
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            return this;
        }
        return Promise.resolve(this);
    }
    /**
     * Create new page context.
     *
     * @returns {Promise<PageWrapper>}
     */
    async newPage() {
        const browser = await this.getBrowser();
        this._page = await browser.newPage();
        this._page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
        await this._page.setViewport(this.options.viewport);
        return this;
    }
    /**
     * Go To url.
     *
     * @param url
     * @param nextOnError
     * @returns {Promise<PageWrapper>}
     */
    async goto(url, nextOnError = false) {
        if (nextOnError) {
            try {
                await this._page.goto(url);
            }
            catch (err) {
                this.context.config.logger.error(err);
            }
        }
        else {
            await this._page.goto(url);
        }
        return this;
    }
    /**
     * Snap a session (image and html file).
     *
     * @param name
     * @param screenPath
     * @returns {Promise<PageWrapper>}
     */
    async snap(name, screenPath = 'screenshots') {
        if (this._page) {
            this.step++;
            const steppedName = `${this.step}${name ? ` - ${name}` : ``}`;
            fs.mkdirSync(screenPath, { recursive: true });
            // Create file.
            const body = await this.page.evaluate(() => document?.querySelector('html')?.outerHTML);
            fs.writeFileSync(`${screenPath}/${steppedName}.html`, body, 'utf8');
            this.context.config.storage?.file(`${screenPath}/${steppedName}.html`, this.context);
            // Snapshot.
            await this.page.screenshot({ path: `${screenPath}/${steppedName}.png` });
            this.context.config.storage?.file(`${screenPath}/${steppedName}.png`, this.context);
        }
        return Promise.resolve(this);
    }
    /**
     * Wait timeout.
     *
     * @param timeout
     * @returns {Promise<unknown>}
     */
    async wait(timeout = 1000) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(this), timeout);
        });
    }
    /**
     * Scroll to bottom of the page.
     *
     * @returns {Promise<void>}
     */
    async scrollToBottom() {
        const bodyHeight = await this._page.evaluate(() => document.body.clientHeight);
        const windowHeight = await this._page.evaluate(() => window.innerHeight);
        let steps = Math.floor(bodyHeight / windowHeight);
        let size = windowHeight;
        if (steps > 10) {
            steps = 10;
            size = bodyHeight / 10;
        }
        for (let i = 0; i < steps + 2; i++) {
            await scrollPageToBottom(this._page, {
                size: size,
                delay: 200,
            });
        }
    }
    get page() {
        return this._page;
    }
}
