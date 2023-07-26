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
exports.WebAuditCoreClass = void 0;
const ModuleInterface_1 = require("../modules/ModuleInterface");
const Crawler_1 = require("../crawlers/Crawler");
const AbstractPuppeteerJourneyModule_1 = require("../journey/AbstractPuppeteerJourneyModule");
const PageWrapper_1 = require("../journey/PageWrapper");
const WebAuditContext_1 = require("./WebAuditContext");
const WebAuditConfig_1 = require("./WebAuditConfig");
const WebAuditEvent_1 = require("./WebAuditEvent");
/**
 * Web Audit core main entry point for web audition.
 */
class WebAuditCoreClass {
    /**
     * Craw website.
     *
     * @param baseUrl
     * @param options
     */
    crawlWebsite(baseUrlWrapper, journey, options = {}) {
        // Define context.
        WebAuditContext_1.WebAuditContext.current.setId('Crawl')
            .setUrl(baseUrlWrapper.url);
        // Crawl domain.
        options.baseUrl = baseUrlWrapper.url;
        const crawler = new Crawler_1.WebAuditCrawler(baseUrlWrapper, options);
        return crawler.crawl(journey);
    }
    /**
     * Audit urls.
     *
     * @param urls
     * @param modules
     */
    analyseUrls(urls, modules, journey) {
        return __awaiter(this, void 0, void 0, function* () {
            // Define context.
            WebAuditContext_1.WebAuditContext.current.setId('Analyse')
                .setUrl()
                .setData();
            const defaultModules = [];
            const puppeteerJourneyModules = [];
            // Init and sort modules by types (puppeteer or default).
            for (const module of modules) {
                if (module instanceof AbstractPuppeteerJourneyModule_1.AbstractPuppeteerJourneyModule) {
                    puppeteerJourneyModules.push(module);
                }
                else {
                    defaultModules.push(module);
                }
                yield module.init(WebAuditConfig_1.WebAuditConfig, WebAuditContext_1.WebAuditContext.current);
            }
            // Analyser default module
            yield this.analyseDefaultModules(defaultModules, urls);
            // Analyse puppeteer modules.
            try {
                yield this.analysePuppeteerJourneyModules(puppeteerJourneyModules, urls, journey);
            }
            catch (err) {
                console.log(err);
                process.exit();
            }
            // Close modules.
            for (const module of modules) {
                yield module.finish();
            }
        });
    }
    /**
     * Analyse default modules.
     *
     * @param {ModuleInterface[]} defaultModules
     * @param {UrlWrapper[]} urls
     * @returns {Promise<void>}
     * @private
     */
    analyseDefaultModules(modules, urls) {
        return __awaiter(this, void 0, void 0, function* () {
            // Parse urls.
            for (const url of urls) {
                WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.beforeUrlProcess, { module: this, url: url });
                for (const module of modules) {
                    WebAuditContext_1.WebAuditContext.current.setData(module === null || module === void 0 ? void 0 : module.name);
                    yield module.analyse(url);
                }
                WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.afterUrlProcess, { module: this, url: url });
            }
        });
    }
    /**
     * Analyse default modules.
     *
     * @param {ModuleInterface[]} defaultModules
     * @param {UrlWrapper[]} urls
     * @returns {Promise<void>}
     * @private
     */
    analysePuppeteerJourneyModules(modules, urls, journey) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageWrapper = new PageWrapper_1.PageWrapper();
            yield journey.beforeAll(pageWrapper, urls);
            // Init journey.
            for (const module of modules) {
                WebAuditContext_1.WebAuditContext.current.setData(module === null || module === void 0 ? void 0 : module.name);
                yield module.initJourney(journey);
            }
            // Parse urls.
            for (const url of urls) {
                WebAuditConfig_1.WebAuditConfig.logger.success(`URL : ${url.url.toString()}`);
                yield pageWrapper.newPage();
                yield journey.beforeEach(pageWrapper, url);
                WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.beforeUrlProcess, { module: this, url: url });
                // Play journey.
                WebAuditContext_1.WebAuditContext.current.setData(journey.name);
                yield journey.play(pageWrapper, url);
                // Analyse journey after collecting data in journey.
                for (const module of modules) {
                    WebAuditContext_1.WebAuditContext.current.setData(module === null || module === void 0 ? void 0 : module.name);
                    yield module.analyse(url);
                }
                WebAuditEvent_1.WebAuditEvent.emit(ModuleInterface_1.ModuleEvents.afterUrlProcess, { module: this, url: url });
            }
            yield pageWrapper.close();
        });
    }
}
exports.WebAuditCoreClass = WebAuditCoreClass;
