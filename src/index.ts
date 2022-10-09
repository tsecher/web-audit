import {WebAuditConfig} from './core/WebAuditConfig';
import {WebAuditCoreClass} from './core/WebAuditCore';
import {WebAuditContext} from './core/WebAuditContext';

export const Config = WebAuditConfig;
export const Context = WebAuditContext;
export const Core = new WebAuditCoreClass();
