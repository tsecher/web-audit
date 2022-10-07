"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditCoreClass = void 0;
const WebAuditConfig_1 = require("./WebAuditConfig");
/**
 * Web Audit core main entry point for web audition.
 */
class WebAuditCoreClass {
    auditUrl(url, options = {}) {
    }
    parseDomain(url, options = {}) {
        WebAuditConfig_1.WebAuditConfig.logger.error("mon erreur", "test", "ok");
        WebAuditConfig_1.WebAuditConfig.logger.message("message", "test", "ok");
        WebAuditConfig_1.WebAuditConfig.logger.warning("warning", "test", "ok");
        WebAuditConfig_1.WebAuditConfig.logger.success("success", "test", "ok");
        return ["test", "ok"];
    }
}
exports.WebAuditCoreClass = WebAuditCoreClass;
