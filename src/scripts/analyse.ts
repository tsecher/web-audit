import {Core} from '../index';
import {WebAuditContext as Context} from '../core/WebAuditContext';
import {WebAuditConfig as Config} from '../core/WebAuditConfig';
import CSVStorage from '../storage/csv/CSVStorage';

import {getArgs} from './args';

function doAnalyse(args: any) {
  const {urls, modules, version} = args;

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

  Core.analyseUrls(urls, modules).then(success).catch(error);
}

// Get args.
getArgs(['urlsFiles', 'modules', 'version'], Config.logger)
  .then((args) => doAnalyse(args))
  .catch((error) => Config.logger.exit(error));
