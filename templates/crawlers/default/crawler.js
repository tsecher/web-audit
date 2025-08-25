import {WebAuditCrawler} from 'web_audit/dist/crawlers/Crawler.js';

/**
 * <%= readable_name; %>.
 */
export default class <%= CamelName; %>Crawler extends WebAuditCrawler {
    static id = `<%= snake_name; %>`;
    static label = `<%= readable_name; %>`;
}
