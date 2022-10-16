"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const WebAuditContext_1 = require("../core/WebAuditContext");
const WebAuditConfig_1 = require("../core/WebAuditConfig");
const CSVStorage_1 = __importDefault(require("../storage/csv/CSVStorage"));
const args_1 = require("./args");
function doCrawl(args) {
    const { urls } = args;
    /** ======================================================
     ||                  OPTIONS                      ||
     =======================================================*/
    const options = {
        // 'followSearchParams': false,
        isEligibleUrl: (url) => {
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
    WebAuditContext_1.WebAuditContext.current.setVersion(version);
    /** ======================================================
     ||                  Storage                      ||
     =======================================================*/
    // Storage.
    WebAuditConfig_1.WebAuditConfig.setStorage(new CSVStorage_1.default(`./analyses/${urls[0].hostname}`));
    /** ======================================================
     ||                  Crawl                      ||
     =======================================================*/
    // const result = WebAudit.Core.crawlWebsite(new URL('https://www.google.com/'));
    const result = index_1.Core.crawlWebsite(urls[0], options);
}
(0, args_1.getArgs)(['urls'], WebAuditConfig_1.WebAuditConfig.logger)
    .then((args) => doCrawl(args))
    .catch((error) => WebAuditConfig_1.WebAuditConfig.logger.exit(error));
