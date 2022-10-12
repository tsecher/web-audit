"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const WebAuditContext_1 = require("../core/WebAuditContext");
const WebAuditConfig_1 = require("../core/WebAuditConfig");
const CSVStorage_1 = __importDefault(require("../storage/csv/CSVStorage"));
const EcoIndexModule_1 = require("../modules/ecoindex/EcoIndexModule");
const args_1 = require("./args");
const { urls } = (0, args_1.getArgs)(['urls'], WebAuditConfig_1.WebAuditConfig.logger);
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
 ||                  Analyse                      ||
 =======================================================*/
const success = () => WebAuditConfig_1.WebAuditConfig.logger.success(`Analyse success`);
const error = (error) => {
    WebAuditConfig_1.WebAuditConfig.logger.error(`Analyse error :`);
    WebAuditConfig_1.WebAuditConfig.logger.error(error);
};
index_1.Core.analyseUrls(urls, [new EcoIndexModule_1.EcoIndexModule()]).then(success).catch(error);
