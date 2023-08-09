import path from 'path';

import {Config, Context, Core, Event} from '../index';
import CSVStorage from '../storage/csv/CSVStorage';
import {UrlWrapper} from '../core/UrlWrapper';
import {AppConfig} from '../app/conf/AppConfig';
import {WebAuditLogger} from '../loggers/Logger';

import {getArgs} from './args';


// Init config.
AppConfig.setConfig(path.resolve(process.cwd(), 'config.json'));

/**
 * Launch analyse.
 *
 * @param args
 */
function doAnalyse(args: any) {
  const {urls, modules, version, journey} = args;

  const urlsWrapper = urls.map((url: URL) => new UrlWrapper(url));

  /** ======================================================
   ||                  Context                      ||
   =======================================================*/
  const config = new Config(
    WebAuditLogger,
    new CSVStorage(`./analyses/${urls[0].hostname}`),
  );

  const eventBus = new Event();

  const context = new Context(config, eventBus);
  context.setVersion(version);


  /** ======================================================
   ||                  Analyse                      ||
   =======================================================*/
  const success = () => {
    WebAuditLogger.success(`Analyse success`);
  };
  const error = (error: any) => {
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
getArgs(['urlsFiles', 'modules', 'version', 'journey'], WebAuditLogger)
  .then((args) => doAnalyse(args))
  .catch((error) => WebAuditLogger.exit(error));
