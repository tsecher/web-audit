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
    const { urls, version } = args;
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
    WebAuditContext_1.WebAuditContext.current.setVersion(version);
    /** ======================================================
     ||                  Storage                      ||
     =======================================================*/
    // Storage.
    WebAuditConfig_1.WebAuditConfig.setStorage(new CSVStorage_1.default(`./analyses/${urls[0].hostname}`));
    /** ======================================================
     ||                  Crawl                      ||
     =======================================================*/
    const result = index_1.Core.crawlWebsite(urls[0], options);
}
(0, args_1.getArgs)(['urls', 'version'], WebAuditConfig_1.WebAuditConfig.logger)
    .then((args) => doCrawl(args))
    .catch((error) => WebAuditConfig_1.WebAuditConfig.logger.exit(error));
