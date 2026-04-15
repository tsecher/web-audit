import fs from 'fs';
import path from 'path';

import {AppConfig} from '##/app/conf/AppConfig';
import {LoggerClass, LoggerInterface, WebAuditLogger} from '##/loggers/Logger';

/**
 * Find logger according to configuration file.
 */
class LoggerFinderClass {

    protected loggers?: LoggerInterface[];

    /**
     * Return the list of available loggers.
     *
     * @returns {LoggerInterface[]}
     */
    public async getLogger(force = false): Promise<LoggerInterface[]> {
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
    protected async initLoggers() {
        const loggers: any = {};
        loggers[WebAuditLogger.id] = WebAuditLogger;

        (await this.getLoggerFromConfig())
            .map((logger: LoggerInterface) => {
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
    protected async getLoggerFromConfig(): Promise<LoggerInterface[]> {
        const loggerDataList = AppConfig.getConfig()?.loggers;
        const loggersList: LoggerInterface[] = [];

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
