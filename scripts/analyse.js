const {Core, Config, Context} = require('../dist/index');
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const CSVStorage = require('../dist/storage/csv/CSVStorage').default;
const {EcoIndexModule} = require('../dist/modules/ecoindex/EcoIndexModule');


const params = yargs(hideBin(process.argv)).argv;


const url = new URL(params.url || 'https://holidev.thomas-secher.fr');
// const url = new URL('https://www.google.com/');


/**======================================================
 ||                  OPTIONS                      ||
 =======================================================*/
const options = {
  // 'followSearchParams': false,
  isEligibleUrl: (url) => {
    const paramsCount = Array.from(url.searchParams).length;
    if (paramsCount > 0) {
      return paramsCount === 1 && url.searchParams.has("page");
    }
    return true;
  }
}


/**======================================================
 ||                  Context                      ||
 =======================================================*/
// Context
const date = new Date()
const version = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + (date.getDate())).slice(-2)}-${date.getHours()}-${date.getMinutes()}`;
Context.current.setVersion(version);


/**======================================================
 ||                  Storage                      ||
 =======================================================*/
// Storage.
Config.setStorage(new CSVStorage(`./analyses/${url.hostname}`, Config.logger));

/**======================================================
 ||                  Crawl                      ||
 =======================================================*/
// const result = WebAudit.Core.crawlWebsite(new URL('https://www.google.com/'));
// const result = Core.crawlWebsite(url, options);


/**======================================================
 ||                  Analyse                      ||
 =======================================================*/
Core.analyseUrls(
  [ url ],
  [
    new EcoIndexModule()
  ]
)