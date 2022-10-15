import {Core} from '../index';
import {WebAuditContext as Context} from '../core/WebAuditContext';
import {WebAuditConfig as Config} from '../core/WebAuditConfig';
import {WebAuditEvent as Event} from '../core/WebAuditEvent';
import {WebAuditCrawlerEvents} from '../crawlers/Crawler';
import CSVStorage from '../storage/csv/CSVStorage';

import {getArgs} from './args';

const {urls} = getArgs(['urls'], Config.logger);

/** ======================================================
 ||                  OPTIONS                      ||
 =======================================================*/
const options = {
  // 'followSearchParams': false,
  isEligibleUrl: (url: URL) => {
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
const date = new Date();
const version = `${date.getFullYear()}-${`0${date.getMonth() + 1}`.slice(-2)}-${`0${date.getDate()}`.slice(-2)}-${date.getHours()}-${date.getMinutes()}`;
Context.current.setVersion(version);


/** ======================================================
 ||                  Storage                      ||
 =======================================================*/
// Storage.
Config.setStorage(new CSVStorage(`./analyses/${urls[0].hostname}`));


/** ======================================================
 ||                  Crawl                      ||
 =======================================================*/
// const result = WebAudit.Core.crawlWebsite(new URL('https://www.google.com/'));
const result = Core.crawlWebsite(urls[0], options);
