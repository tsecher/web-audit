import path from 'path';
import { Config, Context, Core, Event } from '##/index';
import { UrlWrapper } from '##/core/UrlWrapper';
import { AppConfig, AppConfigFileName } from '##/app/conf/AppConfig';
import { getArgs } from '##/scripts/args';
import { WebAuditLogger } from '##/loggers/Logger';
// Init config.
await AppConfig.setConfig(path.resolve(process.cwd(), AppConfigFileName));
async function doCrawl(args) {
    const { urls, version, journey, crawler, storage, logger } = args;
    /** ======================================================
     ||                  OPTIONS                      ||
     =======================================================*/
    const options = {
        // 'followSearchParams': false,
        isEligibleUrl: (url, crawler) => {
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
    const config = new Config(logger, storage, AppConfig);
    const eventBus = new Event();
    const context = new Context(config, eventBus);
    context.setVersion(version);
    /** ======================================================
     ||                  Crawl                      ||
     =======================================================*/
    const core = new Core(context);
    return core.crawlWebsite(crawler, new UrlWrapper(urls[0]), journey, options);
}
getArgs(['urls', 'version', 'journey', 'crawler', 'storage', 'logger'])
    .then((args) => doCrawl(args))
    .catch((error) => WebAuditLogger.exit(error));
