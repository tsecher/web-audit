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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcoindexPage = exports.ECOINDEX_PAGE_EVENTS = void 0;
/**
 * Ecoindex page wrapper.
 */
const puppeteer_autoscroll_down_1 = require("puppeteer-autoscroll-down");
const AbstractEventsClass_1 = require("../../../journey/AbstractEventsClass");
const EcoindexDataHandler_1 = require("./EcoindexDataHandler");
/**
 * Events.
 *
 * @type {{AFTER_INIT: string, PAGE_LOADED: string, AFTER_SCROLL: string, AFTER_VISIT: string}}
 */
exports.ECOINDEX_PAGE_EVENTS = {
    AFTER_INIT: 'After initialization',
    AFTER_VISIT: 'After visit url',
    PAGE_LOADED: 'Pages has been loaded',
    AFTER_SCROLL: 'After scroll',
};
/**
 * Get the ecoindex raw data for a specific page.
 */
class EcoindexPage extends AbstractEventsClass_1.AbstractEventsClass {
    /** ======================================================
     ||                  Analyse
     ======================================================= */
    analyseUrl(page, url, conf = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign(Object.assign({}, EcoindexDataHandler_1.ECOINDEX_HANDLER_OPTIONS), conf);
            const handler = new EcoindexDataHandler_1.EcoindexDataHandler(page, options);
            const eventData = { page: page, url: url, options: options, handler: handler };
            yield handler.init();
            yield this.trigger(exports.ECOINDEX_PAGE_EVENTS.AFTER_INIT, eventData);
            // Load the page.
            yield page.goto(url, { timeout: options.timeout });
            yield this.trigger(exports.ECOINDEX_PAGE_EVENTS.AFTER_VISIT, eventData);
            try {
                yield page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: options.timeout });
            }
            catch (err) {
                console.log(`Too long`);
            }
            yield this.trigger(exports.ECOINDEX_PAGE_EVENTS.PAGE_LOADED, eventData);
            // Scroll to bottom in order to load all imgs dependencies.
            yield this.scrollToBottom(page);
            yield this.trigger(exports.ECOINDEX_PAGE_EVENTS.AFTER_SCROLL, eventData);
            // Get result.
            const result = handler.getRawResult();
            handler.stop();
            return result;
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
}
exports.EcoindexPage = EcoindexPage;
