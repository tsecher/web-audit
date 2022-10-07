import {WebAuditConfig as Config} from "./WebAuditConfig";

export interface WebAuditCoreInterface {
    parseDomain(url: string, options?: any): string[];

    auditUrl(url: string, options?: any): any;
}


/**
 * Web Audit core main entry point for web audition.
 */
export class WebAuditCoreClass implements WebAuditCoreInterface {

    public auditUrl(url: string, options: any = {}): any {
    }

    public parseDomain(url: string, options: any = {}): string[] {

        Config.logger.error("mon erreur","test", "ok");
        Config.logger.message("message","test", "ok");
        Config.logger.warning("warning","test", "ok");
        Config.logger.success("success","test", "ok");

        return ["test", "ok"];
    }
}