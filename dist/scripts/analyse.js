import path from 'path';
import { Config, Context, Core, Event } from '##/index';
import { UrlWrapper } from '##/core/UrlWrapper';
import { AppConfig, AppConfigFileName } from '##/app/conf/AppConfig';
import { WebAuditLogger } from '##/loggers/Logger';
import { getArgs } from '##/scripts/args';
// Init config.
AppConfig.setConfig(path.resolve(process.cwd(), AppConfigFileName));
/**
 * Launch analyse.
 *
 * @param args
 */
function doAnalyse(args) {
    const { urls, modules, version, journey, storage, logger } = args;
    const urlsWrapper = urls.map((url) => new UrlWrapper(url));
    /** ======================================================
     ||                  Context                      ||
     =======================================================*/
    // Init storage.
    storage.init(urls, version);
    const config = new Config(logger, storage);
    const eventBus = new Event();
    const context = new Context(config, eventBus);
    context.setVersion(version);
    /** ======================================================
     ||                  Analyse                      ||
     =======================================================*/
    const success = () => {
        WebAuditLogger.success(`Analyse success`);
    };
    const error = (error) => {
        WebAuditLogger.error(`Analyse error :`);
        WebAuditLogger.error(error);
    };
    // Const
    const core = new Core(context);
    core.analyseUrls(urlsWrapper, modules, journey)
        .then(success)
        .catch(error);
}
// Get args.
getArgs(['urlsFiles', 'modules', 'version', 'journey', 'storage', 'logger'])
    .then((args) => doAnalyse(args))
    .catch((error) => WebAuditLogger.exit(error));
