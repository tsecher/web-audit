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
exports.analyseURL = void 0;
const PuppeteerHar = require('puppeteer-har');
const translator = require('greenit-cli/cli-core/translator.js').translator;
const { scrollPageToBottom } = require('puppeteer-autoscroll-down');
const ecoindex = require('ecoindex');
//Analyse a webpage
function analyseURL(page, url, options, scriptPath, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = {};
        try {
            //get har file
            const pptrHar = new PuppeteerHar(page);
            yield pptrHar.start();
            // disabling cache
            yield page.setCacheEnabled(false);
            // Init network events.
            yield initNetworksEvents(page, result, logger);
            // Go to url.
            yield page.goto(url, { timeout: options.timeout });
            try {
                yield page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 3000 });
            }
            catch (e) {
                logger.warning(`Wait too long...`);
            }
            yield scrollToBottom(page);
            // Get nb elements in dom once loaded.
            yield initNbElementsInPage(page, result, logger);
            result.ecoIndex = ecoindex.computeEcoIndex(result.domSize, result.nbRequest, result.responsesSize / 1000);
            result.grade = ecoindex.getEcoIndexGrade(result.ecoIndex);
            result.waterConsumption = ecoindex.computeWaterConsumptionfromEcoIndex(result.ecoIndex);
            result.greenhouseGasesEmission = ecoindex.computeGreenhouseGasesEmissionfromEcoIndex(result.ecoIndex);
            if (options.bestPracticesAnalyse) {
                result.bestPractices = yield getBestPracticeAnalysis(page, pptrHar, scriptPath);
            }
            result.success = true;
        }
        catch (error) {
            result.success = false;
            logger.error(`Error while analyzing URL url : `, error);
        }
        const date = new Date();
        result.date = `${date.toLocaleDateString('fr')} ${date.toLocaleTimeString('fr')}`;
        result.index = options.index;
        return result;
    });
}
exports.analyseURL = analyseURL;
/**
 * Get Nb elements in DOM.
 *
 * @param page
 * @returns {Promise<*>}
 */
function initNbElementsInPage(page, rawResult = {}, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        rawResult.domSize = yield page.evaluate(() => (document.querySelectorAll('*').length - document.querySelectorAll('svg *').length));
    });
}
/**
 * Init networks data.
 *
 * @param page
 * @param rawResult
 * @returns {Promise<void>}
 */
function initNetworksEvents(page, rawResult, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        rawResult.nbRequest = rawResult.nbRequest || 0;
        rawResult.responsesSize = rawResult.responsesSize || 0;
        const devToolsResponses = new Map();
        const devTools = yield page.target().createCDPSession();
        yield devTools.send("Network.enable");
        devTools.on("Network.responseReceived", (event) => {
            devToolsResponses.set(event.requestId, event.response);
        });
        devTools.on("Network.loadingFinished", (event, response) => {
            rawResult.nbRequest++;
            rawResult.responsesSize += event.encodedDataLength;
        });
    });
}
/**
 * Scroll to bottom.
 *
 * @param page
 * @returns {Promise<void>}
 */
function scrollToBottom(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const bodyHeight = yield page.evaluate(() => document.body.clientHeight);
        const windowHeight = yield page.evaluate(() => window.innerHeight);
        for (let i = 0; i < Math.floor(bodyHeight / windowHeight) + 2; i++) {
            yield scrollPageToBottom(page, {
                size: windowHeight,
                delay: 200
            });
        }
    });
}
/**
 * Analyse best practices.
 *
 * @param page
 * @returns {Promise<*>}
 */
function getBestPracticeAnalysis(page, pptrHar, scriptPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let harObj = yield pptrHar.stop();
        //get ressources
        const client = yield page.target().createCDPSession();
        let ressourceTree = yield client.send('Page.getResourceTree');
        yield client.detach();
        // replace chrome.i18n.getMessage call by i18n custom implementation working in page
        // fr is default catalog
        yield page.evaluate(language_array => (chrome = {
            "i18n": {
                "getMessage": function (message, parameters = []) {
                    return language_array[message].replace(/%s/g, function () {
                        // parameters is string or array
                        return Array.isArray(parameters) ? parameters.shift() : parameters;
                    });
                }
            }
        }), translator.getCatalog());
        //add script, get run, then remove it to not interfere with the analysis
        let script = yield page.addScriptTag({ path: scriptPath });
        yield script.evaluate(x => (x.remove()));
        //pass node object to browser
        yield page.evaluate(x => (har = x), harObj.log);
        yield page.evaluate(x => (resources = x), ressourceTree.frameTree.resources);
        const result = yield page.evaluate(() => (launchAnalyse()));
        yield page.close();
        result.success = true;
        result.nbBestPracticesToCorrect = 0;
        // Compute number of times where best practices are not respected
        for (let key in result.bestPractices) {
            if ((result.bestPractices[key].complianceLevel || "A") !== "A") {
                result.nbBestPracticesToCorrect++;
            }
        }
        return result.bestPractices;
    });
}
