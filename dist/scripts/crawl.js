"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
const UrlWrapper_1 = require("../core/UrlWrapper");
const CSVStorage_1 = __importDefault(require("../storage/csv/CSVStorage"));
const AppConfig_1 = require("../app/conf/AppConfig");
const Logger_1 = require("../loggers/Logger");
const args_1 = require("./args");
// Init config.
AppConfig_1.AppConfig.setConfig(path_1.default.resolve(process.cwd(), 'config.json'));
function doCrawl(args) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const config = new index_1.Config(Logger_1.WebAuditLogger, new CSVStorage_1.default(`./analyses/${urls[0].hostname}`));
        const eventBus = new index_1.Event();
        const context = new index_1.Context(config, eventBus);
        context.setVersion(version);
        /** ======================================================
         ||                  Crawl                      ||
         =======================================================*/
        const core = new index_1.Core(context);
        return core.crawlWebsite(new UrlWrapper_1.UrlWrapper(urls[0]), journey, options);
    });
}
(0, args_1.getArgs)(['urls', 'version', 'journey'], Logger_1.WebAuditLogger)
    .then((args) => doCrawl(args))
    .catch((error) => Logger_1.WebAuditLogger.exit(error));
