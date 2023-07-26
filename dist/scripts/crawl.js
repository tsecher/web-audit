"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
const WebAuditContext_1 = require("../core/WebAuditContext");
const WebAuditConfig_1 = require("../core/WebAuditConfig");
const UrlWrapper_1 = require("../core/UrlWrapper");
const CSVStorage_1 = __importDefault(require("../storage/csv/CSVStorage"));
const AppConfig_1 = require("../app/conf/AppConfig");
const args_1 = require("./args");
// Init config.
AppConfig_1.AppConfig.setConfig(path_1.default.resolve(process.cwd(), 'config.json'));
function doCrawl(args) {
    const { urls, version, journey } = args;
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
    WebAuditContext_1.WebAuditContext.current.setVersion(version);
    /** ======================================================
     ||                  Storage                      ||
     =======================================================*/
    // Storage.
    WebAuditConfig_1.WebAuditConfig.setStorage(new CSVStorage_1.default(`./analyses/${urls[0].hostname}`));
    /** ======================================================
     ||                  Crawl                      ||
     =======================================================*/
    const result = index_1.Core.crawlWebsite(new UrlWrapper_1.UrlWrapper(urls[0]), journey, options);
}
(0, args_1.getArgs)(['urls', 'version', 'journey'], WebAuditConfig_1.WebAuditConfig.logger)
    .then((args) => doCrawl(args))
    .catch((error) => WebAuditConfig_1.WebAuditConfig.logger.exit(error));
