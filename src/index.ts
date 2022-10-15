import {WebAuditConfig} from './core/WebAuditConfig';
import {WebAuditCoreClass} from './core/WebAuditCore';
import {WebAuditContext} from './core/WebAuditContext';
import {WebAuditEvent} from './core/WebAuditEvent';

export const Config = WebAuditConfig;
export const Context = WebAuditContext;
export const Core = new WebAuditCoreClass();
export const Event = WebAuditEvent;
