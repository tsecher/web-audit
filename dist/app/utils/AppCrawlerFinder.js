import fs from 'fs';
import path from 'path';
import { AppConfig } from '##/app/conf/AppConfig';
import { WebAuditCrawler } from '##/crawlers/Crawler';
/**
 * Find crawler according to configuration file.
 */
class CrawlerFinderClass {
    crawlers;
    /**
     * Return the list of available crawlers.
     *
     * @returns {WebAuditCrawlerInterface[]}
     */
    async getCrawler(force = false) {
        if (force || !this.crawlers) {
            await this.initCrawlers();
        }
        return this.crawlers || [];
    }
    /**
     * Init crawlers.
     *
     * @protected
     */
    async initCrawlers() {
        const crawlers = {};
        const defaultCrawler = WebAuditCrawler;
        crawlers[defaultCrawler.id] = defaultCrawler;
        (await this.getCrawlerFromConfig())
            .map((crawler) => {
            crawlers[crawler.id] = crawler;
        });
        this.crawlers = Object.values(crawlers);
    }
    /**
     * BUild the crawler list from crawler path.
     *
     * @param {string[]} crawlerDataList
     * @returns {WebAuditCrawlerInterface[]}
     * @protected
     */
    async getCrawlerFromConfig() {
        const crawlerDataList = AppConfig.getConfig()?.crawlers;
        const crawlersList = [];
        if (crawlerDataList && crawlerDataList.length) {
            for (const crawlerData of crawlerDataList) {
                const crawlerPath = path.resolve(process.cwd(), crawlerData);
                if (fs.existsSync(crawlerPath)) {
                    const CrawlerClass = (await import(crawlerPath)).default;
                    crawlersList.push(CrawlerClass);
                }
            }
        }
        return crawlersList;
    }
}
export const CrawlerFinder = new CrawlerFinderClass();
