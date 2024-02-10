import fs from 'fs';
import path from 'path';

import {AppConfig, AppConfigFileName} from '##/app/conf/AppConfig';
import {WebAuditCrawler, WebAuditCrawlerInterface} from '##/crawlers/Crawler';

/**
 * Find crawler according to configuration file.
 */
class CrawlerFinderClass {

  protected crawlers?: WebAuditCrawlerInterface[];

  /**
   * Return the list of available crawlers.
   *
   * @returns {WebAuditCrawlerInterface[]}
   */
  public async getCrawler(force = false): Promise<WebAuditCrawlerInterface[]> {
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
  protected async initCrawlers() {
    const crawlers: any = {};
    const defaultCrawler = WebAuditCrawler;
    crawlers[defaultCrawler.id] = defaultCrawler;

    (await this.getCrawlerFromConfig())
      .map((crawler: any) => {
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
  protected async getCrawlerFromConfig(): Promise<WebAuditCrawlerInterface[]> {
    const crawlerDataList = AppConfig.getConfig()?.crawlers;

    const crawlersList: WebAuditCrawlerInterface[] = [];

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
