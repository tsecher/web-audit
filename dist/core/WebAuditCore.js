"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditCoreClass = void 0;
const Crawler_1 = require("../crawlers/Crawler");
const WebAuditContext_1 = require("./WebAuditContext");
const WebAuditConfig_1 = require("./WebAuditConfig");
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
        // Define context.
        WebAuditContext_1.WebAuditContext.current.setId('Crawl').setUrl().setData();
        // Init modules.
        modules.forEach((module) => module.init(WebAuditConfig_1.WebAuditConfig, WebAuditContext_1.WebAuditContext.current));
        // Parse urls.
        urls.forEach((url) => {
            WebAuditContext_1.WebAuditContext.current.setUrl(url);
            // Prepare analyser.
            modules.forEach((module) => {
                WebAuditContext_1.WebAuditContext.current.setData(module.name);
                module.analyse(url);
            });
        });
    }
}
exports.WebAuditCoreClass = WebAuditCoreClass;
