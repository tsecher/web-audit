import path from 'path';
import { Config, Context, Core, Event } from '##/index';
import { UrlWrapper } from '##/core/UrlWrapper';
import CSVStorage from '##/storage/csv/CSVStorage';
import { AppConfig, AppConfigFileName } from '##/app/conf/AppConfig';
import { WebAuditLogger } from '##/loggers/Logger';
import { getArgs } from '##/scripts/args';
// Init config.
AppConfig.setConfig(path.resolve(process.cwd(), AppConfigFileName));
async function doCrawl(args) {
    const { urls, version, journey, crawler } = args;
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
    // Context
    const config = new Config(WebAuditLogger, new CSVStorage(`./analyses/${urls[0].hostname}`));
    const eventBus = new Event();
    const context = new Context(config, eventBus);
    context.setVersion(version);
    /** ======================================================
     ||                  Crawl                      ||
     =======================================================*/
    const core = new Core(context);
    return core.crawlWebsite(crawler, new UrlWrapper(urls[0]), journey, options);
}
getArgs(['urls', 'version', 'journey', 'crawler'], WebAuditLogger)
    .then((args) => doCrawl(args))
    .catch((error) => WebAuditLogger.exit(error));
