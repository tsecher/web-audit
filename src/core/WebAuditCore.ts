import {WebAuditCrawler} from "../crawlers/Crawler";
import {WebAuditContext as Context} from "./WebAuditContext";


/**
 * Web Audit core main entry point for web audition.
 */
export class WebAuditCoreClass {

    public auditUrl(url: string, options: any = {}): any {
    }

    public crawlWebsite(base_url: URL, options: any = {}): Promise<any> {
        
        // Define context.
        Context.current.setId('Crawl').setUrl(base_url);

        // Crawl domain.
        const crawler = new WebAuditCrawler({
            base_url: base_url,
        });
        return crawler.crawl();
    }
}