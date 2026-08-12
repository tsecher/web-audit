import { WebAuditContextClass } from '##/core/WebAuditContext';
import colors from 'colors';
import Table from 'cli-table3';
import { ModuleEvents, ModuleInterface } from '##/modules/ModuleInterface';
import targetHandler from '##/target/TargetHandler';

/**
 * Logger Interface.
 */
export interface LoggerInterface {

    /**
     * Name.
     *
     * @returns {string}
     */
    get name(): string;

    /**
     * ID.
     *
     * @returns {string}
     */
    get id(): string;

    /**
     * Prepare logger.
     */
    prepare(context: WebAuditContextClass): void;

    /**
     * Log a message.
     *
     * @param data
     * @param id
     */
    message(data?: any, id?: string): void;

    /**
     * Log a success message.
     *
     * @param data
     * @param id
     */
    success(data?: any, id?: string): void;

    /**
     * Log a warning message.
     *
     * @param data
     * @param id
     */
    warning(data?: any, id?: string): void;

    /**
     * Log an error message.
     *
     * @param data
     * @param id
     */
    error(data?: any, id?: string): void;

    /**
     * Log an error message and exit process.
     *
     * @param data
     * @param id
     */
    exit(data?: any, id?: string): void;

    /**
     * Log results.
     *
     * @param {string} name
     * @param data
     * @param {string} id
     */
    result(name: string, data: any, id?: string): void;
}

/**
 * Logger class.
 */
export class LoggerClass implements LoggerInterface {

    get id(): string {
        return 'console';
    }

    get name(): string {
        return 'Console';
    }

    /**
     * {@inheritdoc}
     */
    prepare(context: WebAuditContextClass) {
        context.eventBus.on(ModuleEvents.onAnalyseSummary, (data) => {
            const stored = data.data?.module || null;
			const summary = data.data.summary || null;
			const group_id = data.data.group_id || null;

			if (stored && summary) {
				this.onAnalyse(stored, group_id, context, summary);
			}
        });
    }

    onAnalyse(stored:ModuleInterface, group_id: string, context: WebAuditContextClass, result:any) {
		const parsedData = targetHandler.parseErrorData(stored, group_id, context, result);

        const summary = {};
        const labels = targetHandler.getStructureLabels(stored, group_id, context);

        Object.entries(labels).forEach(([id, data]) => {
            summary[labels[id]] = parsedData.data[id]?.value;
        });

        this.result(group_id, summary, result.url);
	}

    error(data: any, id?: string): void {
        this.log(data, id, colors.red);
    }

    message(data: any, id?: string): void {
        this.log(data, id);
    }

    success(data: any, id?: string): void {
        this.log(data, id, colors.green);
    }

    warning(data: any, id?: string): void {
        this.log(data, id, colors.yellow);
    }

    exit(data?: any, id?: string): void {
        this.error(data, id);
        process.exit();
    }

    result(name: string, values: any, id?: string): void {
        this.log(`${colors.bgGreen(`[${name}] : `)}`, id);
        this.table(values);
    }

    table(values:any) {
        const table = new Table({
               head: Object.keys(values).map(value => colors.bold(value)),
            });

        table.push(Object.values(values));
        console.log(table.toString());
    }

    /**
     * {@inheritdoc}
     */
    protected log(data: any, id?: string, color?: Function): void {
        const variables = [];
        if (id) {
            variables.push(`[${id}] `);
        }
        variables.push(data);

        if (color) {
            console.log(color(...variables));
        } else {
            console.log(...variables);
        }
    }

}

/**
 * Default logger class.
 */
export const WebAuditLogger = new LoggerClass();
