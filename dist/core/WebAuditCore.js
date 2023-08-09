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
/**
 * Web Audit core main entry point for web audition.
 */
class WebAuditCoreClass {
    constructor(context) {
        this.context = context;
    }
    /**
     * Craw website.
     *
     * @param baseUrlWrapper
     * @param journey
     * @param options
     */
    crawlWebsite(baseUrlWrapper, journey, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // Define context.
            this.context.setId('Crawl')
                .setUrl(baseUrlWrapper.url);
            // Crawl domain.
            options.baseUrl = baseUrlWrapper.url;
            const crawler = new Crawler_1.WebAuditCrawler(this.context, baseUrlWrapper, options);
            yield crawler.crawl(journey);
            this.context.eventBus.emit(Crawler_1.WebAuditCrawlerEvents.onCrawlUrlsEnd, { crawler: crawler, core: this });
        });
    }
    /**
     * Audit urls.
     *
     * @param urls
     * @param modules
     * @param journey
     */
    analyseUrls(urls, modules, journey) {
        return __awaiter(this, void 0, void 0, function* () {
            // Define context.
            this.context.setId('Analyse')
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
                yield module.init(this.context);
            }
            // Analyser default module
            yield this.analyseDefaultModules(defaultModules, urls);
            // Analyse puppeteer modules.
            try {
                yield this.analysePuppeteerJourneyModules(puppeteerJourneyModules, urls, journey);
            }
            catch (err) {
                console.log(err);
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
     * @param modules
     * @param {UrlWrapper[]} urls
     * @returns {Promise<void>}
     * @private
     */
    analyseDefaultModules(modules, urls) {
        return __awaiter(this, void 0, void 0, function* () {
            // Parse urls.
            for (const url of urls) {
                this.context.eventBus.emit(ModuleInterface_1.ModuleEvents.beforeUrlProcess, { module: this, url: url });
                for (const module of modules) {
                    this.context.setData(module === null || module === void 0 ? void 0 : module.name);
                    yield module.analyse(url);
                }
                this.context.eventBus.emit(ModuleInterface_1.ModuleEvents.afterUrlProcess, { module: this, url: url });
            }
        });
    }
    /**
     * Analyse default modules.
     *
     * @param modules
     * @param {UrlWrapper[]} urls
     * @param journey
     * @returns {Promise<void>}
     * @private
     */
    analysePuppeteerJourneyModules(modules, urls, journey) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageWrapper = new PageWrapper_1.PageWrapper(this.context);
            journey.context = this.context;
            yield journey.beforeAll(pageWrapper, urls);
            // Init journey.
            for (const module of modules) {
                this.context.setData(module === null || module === void 0 ? void 0 : module.name);
                yield module.initJourney(journey);
            }
            // Parse urls.
            for (const url of urls) {
                this.context.config.logger.success(`URL : ${url.url.toString()}`);
                yield pageWrapper.newPage();
                yield journey.beforeEach(pageWrapper, url);
                this.context.eventBus.emit(ModuleInterface_1.ModuleEvents.beforeUrlProcess, { module: this, url: url });
                // Play journey.
                this.context.setData(journey.name);
                yield journey.play(pageWrapper, url);
                // Analyse journey after collecting data in journey.
                for (const module of modules) {
                    this.context.setData(module === null || module === void 0 ? void 0 : module.name);
                    yield module.analyse(url);
                }
                this.context.eventBus.emit(ModuleInterface_1.ModuleEvents.afterUrlProcess, { module: this, url: url });
            }
            yield pageWrapper.close();
        });
    }
}
exports.WebAuditCoreClass = WebAuditCoreClass;
