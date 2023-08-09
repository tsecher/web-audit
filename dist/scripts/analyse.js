"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
const CSVStorage_1 = __importDefault(require("../storage/csv/CSVStorage"));
const UrlWrapper_1 = require("../core/UrlWrapper");
const AppConfig_1 = require("../app/conf/AppConfig");
const Logger_1 = require("../loggers/Logger");
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
    const config = new index_1.Config(Logger_1.WebAuditLogger, new CSVStorage_1.default(`./analyses/${urls[0].hostname}`));
    const eventBus = new index_1.Event();
    const context = new index_1.Context(config, eventBus);
    context.setVersion(version);
    /** ======================================================
     ||                  Analyse                      ||
     =======================================================*/
    const success = () => {
        Logger_1.WebAuditLogger.success(`Analyse success`);
    };
    const error = (error) => {
        Logger_1.WebAuditLogger.error(`Analyse error :`);
        Logger_1.WebAuditLogger.error(error);
    };
    // Const
    const core = new index_1.Core(context);
    core.analyseUrls(urlsWrapper, modules, journey)
        .then(success)
        .catch(error);
}
// Get args.
(0, args_1.getArgs)(['urlsFiles', 'modules', 'version', 'journey'], Logger_1.WebAuditLogger)
    .then((args) => doAnalyse(args))
    .catch((error) => Logger_1.WebAuditLogger.exit(error));
