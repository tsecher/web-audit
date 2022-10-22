"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const WebAuditContext_1 = require("../core/WebAuditContext");
const WebAuditConfig_1 = require("../core/WebAuditConfig");
const CSVStorage_1 = __importDefault(require("../storage/csv/CSVStorage"));
const UrlWrapper_1 = require("../core/UrlWrapper");
const args_1 = require("./args");
function doAnalyse(args) {
    const { urls, modules, version } = args;
    const urlsWrapper = urls.map((url) => new UrlWrapper_1.UrlWrapper(url));
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
     ||                  Analyse                      ||
     =======================================================*/
    const success = () => WebAuditConfig_1.WebAuditConfig.logger.success(`Analyse success`);
    const error = (error) => {
        WebAuditConfig_1.WebAuditConfig.logger.error(`Analyse error :`);
        WebAuditConfig_1.WebAuditConfig.logger.error(error);
    };
    index_1.Core.analyseUrls(urlsWrapper, modules).then(success).catch(error);
}
// Get args.
(0, args_1.getArgs)(['urlsFiles', 'modules', 'version'], WebAuditConfig_1.WebAuditConfig.logger)
    .then((args) => doAnalyse(args))
    .catch((error) => WebAuditConfig_1.WebAuditConfig.logger.exit(error));
