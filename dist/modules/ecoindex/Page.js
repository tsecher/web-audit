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
const path = require('path');
const translator = require('greenit-cli/cli-core/translator.js').translator;
//Analyse a webpage
function analyseURL(page, url, options, scriptPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = {};
        try {
            //get har file
            const pptrHar = new PuppeteerHar(page);
            yield pptrHar.start();
            //go to url
            yield page.goto(url, { timeout: options.timeout });
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
            result = yield page.evaluate(() => (launchAnalyse()));
            yield page.close();
            result.success = true;
            result.nbBestPracticesToCorrect = 0;
            // Compute number of times where best practices are not respected
            for (let key in result.bestPractices) {
                if ((result.bestPractices[key].complianceLevel || "A") !== "A") {
                    result.nbBestPracticesToCorrect++;
                }
            }
        }
        catch (error) {
            result.success = false;
            console.error(`Error while analyzing URL url : `, error);
        }
        const date = new Date();
        result.date = `${date.toLocaleDateString('fr')} ${date.toLocaleTimeString('fr')}`;
        result.index = options.index;
        return result;
    });
}
exports.analyseURL = analyseURL;
