import path from 'path';

import {Core} from '../index';
import {WebAuditContext as Context} from '../core/WebAuditContext';
import {WebAuditConfig as Config} from '../core/WebAuditConfig';
import CSVStorage from '../storage/csv/CSVStorage';
import {UrlWrapper} from '../core/UrlWrapper';
import {AppConfig} from '../app/conf/AppConfig';

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
  // Context
  Context.current.setVersion(version);


  /** ======================================================
   ||                  Storage                      ||
   =======================================================*/
// Storage.
  Config.setStorage(new CSVStorage(`./analyses/${urls[0].hostname}`));

  /** ======================================================
   ||                  Analyse                      ||
   =======================================================*/
  const success = () => Config.logger.success(`Analyse success`);
  const error = (error: any) => {
    Config.logger.error(`Analyse error :`);
    Config.logger.error(error);
  };

  Core.analyseUrls(urlsWrapper, modules, journey).then(success).catch(error);
}

// Get args.
getArgs(['urlsFiles', 'modules', 'version', 'journey'], Config.logger)
  .then((args) => doAnalyse(args))
  .catch((error) => Config.logger.exit(error));
