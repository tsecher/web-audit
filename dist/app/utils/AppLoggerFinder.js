import fs from 'fs';
import path from 'path';
import { AppConfig } from '##/app/conf/AppConfig';
import { WebAuditLogger } from '##/loggers/Logger';
/**
 * Find logger according to configuration file.
 */
class LoggerFinderClass {
    loggers;
    /**
     * Return the list of available loggers.
     *
     * @returns {LoggerInterface[]}
     */
    async getLogger(force = false) {
        if (force || !this.loggers) {
            await this.initLoggers();
        }
        return this.loggers || [];
    }
    /**
     * Init loggers.
     *
     * @protected
     */
    async initLoggers() {
        const loggers = {};
        loggers[WebAuditLogger.id] = WebAuditLogger;
        (await this.getLoggerFromConfig())
            .map((logger) => {
            loggers[logger.id] = logger;
        });
        this.loggers = Object.values(loggers);
    }
    /**
     * BUild the logger list from logger path.
     *
     * @param {string[]} loggerDataList
     * @returns {LoggerInterface[]}
     * @protected
     */
    async getLoggerFromConfig() {
        const loggerDataList = AppConfig.getConfig()?.loggers;
        const loggersList = [];
        if (loggerDataList && loggerDataList.length) {
            for (const loggerData of loggerDataList) {
                const loggerPath = path.resolve(process.cwd(), loggerData);
                if (fs.existsSync(loggerPath)) {
                    const LoggerClass = (await import(loggerPath)).default;
                    loggersList.push(LoggerClass);
                }
            }
        }
        return loggersList;
    }
}
export const LoggerFinder = new LoggerFinderClass();
