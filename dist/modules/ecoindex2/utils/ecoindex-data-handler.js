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
exports.EcoindexDataHandler = exports.ECOINDEX_HANDLER_OPTIONS = exports.EcoindexStructure = void 0;
/**
 * Ecoindex data structure.
 */
class EcoindexStructure {
    constructor(dom = 0, request = null, size = null) {
        this.dom = dom;
        this.request = request;
        this.size = size;
    }
}
exports.EcoindexStructure = EcoindexStructure;
/**
 * Handler options.
 *
 * @type {{wait: number}}
 */
exports.ECOINDEX_HANDLER_OPTIONS = {
    wait: 3000,
    timeout: 3000,
};
/**
 * Object that will get the several data needed by the ecoindex computor.
 */
class EcoindexDataHandler {
    /**
     * Constructor
     *
     * @param page Puppeteer page.
     * @param options Options.
     */
    constructor(page, options) {
        this.page = page;
        this.options = Object.assign(Object.assign({}, exports.ECOINDEX_HANDLER_OPTIONS), options);
    }
    /**
     * Init ecoindex puppeteer page configuration and listeners.
     *
     * @returns {Promise<void>}
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.clearResults();
            // disabling cache
            const client = yield this.page.target()
                .createCDPSession();
            yield client.send('Network.clearBrowserCache');
            // Init network events.
            yield this._initNetworksEvents();
        });
    }
    /**
     * Init networks events.
     *
     * @returns {Promise<void>}
     */
    _initNetworksEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            this.raw_results.request = this.raw_results.request || 0;
            this.raw_results.size = this.raw_results.size || 0;
            const dev_tools_responses = new Map();
            const dev_tools = yield this.page.target()
                .createCDPSession();
            yield dev_tools.send("Network.enable");
            dev_tools.on("Network.responseReceived", (event) => {
                dev_tools_responses.set(event.requestId, event.response);
            });
            dev_tools.on("Network.loadingFinished", (event, response) => {
                this.raw_results.request++;
                this.raw_results.size += event.encodedDataLength;
            });
        });
    }
    /**
     * Return the number of elements in dom.
     *
     * @returns {Promise<number>}
     */
    getDOMElementCount() {
        return __awaiter(this, void 0, void 0, function* () {
            this.raw_results.dom = yield this.page.evaluate(() => (document.querySelectorAll('*').length - document.querySelectorAll('svg *').length));
            return this.raw_results.dom;
        });
    }
    /**
     * Return the number of request since initialization.
     *
     * @returns {Promise<unknown>}
     */
    getRequestCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                var _a;
                resolve((_a = this.raw_results) === null || _a === void 0 ? void 0 : _a.request);
            });
        });
    }
    /**
     * Return the response size in (B).
     * @returns {Promise<void>}
     */
    getSize() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                var _a;
                resolve((_a = this.raw_results) === null || _a === void 0 ? void 0 : _a.size);
            });
        });
    }
    /**
     * Return the result.
     *
     * @returns {Promise<EcoindexStructure>}
     */
    getRawResult() {
        return __awaiter(this, void 0, void 0, function* () {
            // Only dom elements are note dynamically populated. So we compute it.
            yield this.getDOMElementCount();
            return this.raw_results;
        });
    }
    /**
     * Clear raw results.
     */
    clearResults() {
        this.raw_results = new EcoindexStructure();
    }
    /**
     * Stop network listening.
     */
    stop() {
        // @todo Stop listeners.
        console.log("==================================");
        console.log("==================================");
        console.log("==================================");
    }
}
exports.EcoindexDataHandler = EcoindexDataHandler;
