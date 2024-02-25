import path from 'path';

import {Config, Context, Core, Event} from '##/index';
import {UrlWrapper} from '##/core/UrlWrapper';
import {WebAuditCrawler} from '##/crawlers/Crawler';
import {AppConfig, AppConfigFileName} from '##/app/conf/AppConfig';
import {WebAuditLogger} from '##/loggers/Logger';
import {getArgs} from '##/scripts/args';

// Init config.
AppConfig.setConfig(path.resolve(process.cwd(), AppConfigFileName));

async function doCrawl(args: any) {
  const {urls, version, journey, crawler, storage} = args;


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
  // Init storage;
  storage.init(urls, version);

  // Context
  const config = new Config(
    WebAuditLogger,
    storage,
  );

  const eventBus = new Event();

  const context = new Context(config, eventBus);
  context.setVersion(version);

  /** ======================================================
   ||                  Crawl                      ||
   =======================================================*/
  const core = new Core(context);
  return core.crawlWebsite(crawler, new UrlWrapper(urls[0]), journey, options);
}

getArgs(['urls', 'version', 'journey', 'crawler', 'storage'], WebAuditLogger)
  .then((args: any) => doCrawl(args))
  .catch((error) => WebAuditLogger.exit(error));
