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
const Crawler_1 = require("../crawlers/Crawler");
const WebAuditContext_1 = require("./WebAuditContext");
const WebAuditConfig_1 = require("./WebAuditConfig");
/**
 * Web Audit core main entry point for web audition.
 */
class WebAuditCoreClass {
    constructor() {
        this.events = {
            beforeCrawlWebsite: 'core_beforeCrawlWebsite',
        };
    }
    /**
     * Craw website.
     *
     * @param baseUrl
     * @param options
     */
    crawlWebsite(baseUrl, options = {}) {
        // Define context.
        WebAuditContext_1.WebAuditContext.current.setId('Crawl').setUrl(baseUrl);
        // Crawl domain.
        options.baseUrl = baseUrl;
        const crawler = new Crawler_1.WebAuditCrawler(options);
        return crawler.crawl();
    }
    /**
     * Audit urls.
     *
     * @param urls
     * @param modules
     */
    analyseUrls(urls, modules) {
        return __awaiter(this, void 0, void 0, function* () {
            // Define context.
            WebAuditContext_1.WebAuditContext.current.setId('Crawl').setUrl().setData();
            // Init modules.
            for (const module of modules) {
                yield module.init(WebAuditConfig_1.WebAuditConfig, WebAuditContext_1.WebAuditContext.current);
            }
            // Parse urls.
            for (const url of urls) {
                // TODO : optimize async.
                for (const module of modules) {
                    WebAuditContext_1.WebAuditContext.current.setData(module === null || module === void 0 ? void 0 : module.name);
                    yield module.analyse(url);
                }
            }
            // Close modules.
            for (const module of modules) {
                yield module.finish();
            }
        });
    }
}
exports.WebAuditCoreClass = WebAuditCoreClass;
