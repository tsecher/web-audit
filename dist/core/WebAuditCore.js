"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditCoreClass = void 0;
const Crawler_1 = require("../crawlers/Crawler");
const WebAuditContext_1 = require("./WebAuditContext");
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
}
exports.WebAuditCoreClass = WebAuditCoreClass;
