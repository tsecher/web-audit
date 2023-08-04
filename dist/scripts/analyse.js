"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
const WebAuditContext_1 = require("../core/WebAuditContext");
const WebAuditConfig_1 = require("../core/WebAuditConfig");
const CSVStorage_1 = __importDefault(require("../storage/csv/CSVStorage"));
const UrlWrapper_1 = require("../core/UrlWrapper");
const AppConfig_1 = require("../app/conf/AppConfig");
const args_1 = require("./args");
// Init config.
AppConfig_1.AppConfig.setConfig(path_1.default.resolve(process.cwd(), 'config.json'));
/**
 * Launch analyse.
 *
 * @param args
 */
function doAnalyse(args) {
    const { urls, modules, version, journey } = args;
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
    const success = () => {
        WebAuditConfig_1.WebAuditConfig.logger.success(`Analyse success`);
        process.exit();
    };
    const error = (error) => {
        WebAuditConfig_1.WebAuditConfig.logger.error(`Analyse error :`);
        WebAuditConfig_1.WebAuditConfig.logger.error(error);
        process.exit();
    };
    index_1.Core.analyseUrls(urlsWrapper, modules, journey).then(success).catch(error);
}
// Get args.
(0, args_1.getArgs)(['urlsFiles', 'modules', 'version', 'journey'], WebAuditConfig_1.WebAuditConfig.logger)
    .then((args) => doAnalyse(args))
    .catch((error) => WebAuditConfig_1.WebAuditConfig.logger.exit(error));
