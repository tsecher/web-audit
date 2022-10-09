"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = exports.Context = exports.Config = void 0;
const WebAuditConfig_1 = require("./core/WebAuditConfig");
const WebAuditCore_1 = require("./core/WebAuditCore");
const WebAuditContext_1 = require("./core/WebAuditContext");
exports.Config = WebAuditConfig_1.WebAuditConfig;
exports.Context = WebAuditContext_1.WebAuditContext;
exports.Core = new WebAuditCore_1.WebAuditCoreClass();
