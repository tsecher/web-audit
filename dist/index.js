"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = exports.Config = void 0;
const WebAuditConfig_1 = require("./core/WebAuditConfig");
const WebAuditCore_1 = require("./core/WebAuditCore");
exports.Config = WebAuditConfig_1.WebAuditConfig;
exports.Core = new WebAuditCore_1.WebAuditCoreClass();
