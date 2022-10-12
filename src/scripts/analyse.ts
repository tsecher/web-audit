import {Core} from '../index';
import {WebAuditContext as Context} from '../core/WebAuditContext';
import {WebAuditConfig as Config} from '../core/WebAuditConfig';
import CSVStorage from '../storage/csv/CSVStorage';
import {EcoIndexModule} from '../modules/ecoindex/EcoIndexModule';

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
 ||                  Analyse                      ||
 =======================================================*/
const success = () => Config.logger.success(`Analyse success`);
const error = (error: any) => {
  Config.logger.error(`Analyse error :`);
  Config.logger.error(error);
};

Core.analyseUrls(urls, [new EcoIndexModule()]).then(success).catch(error);
