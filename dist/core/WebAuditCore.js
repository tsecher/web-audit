"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditCoreClass = void 0;
const Crawler_1 = require("../crawlers/Crawler");
const WebAuditContext_1 = require("./WebAuditContext");
/**
 * Web Audit core main entry point for web audition.
 */
class WebAuditCoreClass {
    auditUrl(url, options = {}) {
    }
    crawlWebsite(base_url, options = {}) {
        // Define context.
        WebAuditContext_1.WebAuditContext.current.setId('Crawl').setUrl(base_url);
        // Crawl domain.
        const crawler = new Crawler_1.WebAuditCrawler({
            base_url: base_url,
        });
        return crawler.crawl();
    }
}
exports.WebAuditCoreClass = WebAuditCoreClass;
