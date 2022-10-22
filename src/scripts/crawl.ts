import {Core} from '../index';
import {WebAuditContext as Context} from '../core/WebAuditContext';
import {WebAuditConfig as Config} from '../core/WebAuditConfig';
import {UrlWrapper} from '../core/UrlWrapper';
import CSVStorage from '../storage/csv/CSVStorage';
import {WebAuditCrawler} from '../crawlers/Crawler';

import {getArgs} from './args';

function doCrawl(args: any) {
  const {urls, version} = args;


  /** ======================================================
   ||                  OPTIONS                      ||
   =======================================================*/
  const options = {
    // 'followSearchParams': false,
    isEligibleUrl: (url: URL, crawler: WebAuditCrawler) => {
      const paramsCount = Array.from(url.searchParams).length;
      if (paramsCount > 0) {
        return paramsCount === 1 && url.searchParams.has('page');
      }
      return true;
    },
  };


  /** ======================================================
   ||                  Context                      ||
   =======================================================*/
  // Context
  Context.current.setVersion(version);


  /** ======================================================
   ||                  Storage                      ||
   =======================================================*/
  // Storage.
  Config.setStorage(new CSVStorage(`./analyses/${urls[0].hostname}`));


  /** ======================================================
   ||                  Crawl                      ||
   =======================================================*/
  const result = Core.crawlWebsite(new UrlWrapper(urls[0]), options);

}

getArgs(['urls', 'version'], Config.logger)
  .then((args: any) => doCrawl(args))
  .catch((error) => Config.logger.exit(error));
