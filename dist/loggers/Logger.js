import colors from 'colors';
import Table from 'cli-table3';
import { ModuleEvents } from '##/modules/ModuleInterface';
/**
 * Logger class.
 */
export class LoggerClass {
    get id() {
        return 'console';
    }
    get name() {
        return 'Console';
    }
    /**
     * {@inheritdoc}
     */
    prepare(context) {
        context.eventBus.on(ModuleEvents.onAnalyseSummary, (data) => {
            this.result(data.data.group_id, data.data.summary, data.data.url.url.toString());
        });
    }
    error(data, id) {
        this.log(data, id, colors.red);
    }
    message(data, id) {
        this.log(data, id);
    }
    success(data, id) {
        this.log(data, id, colors.green);
    }
    warning(data, id) {
        this.log(data, id, colors.yellow);
    }
    exit(data, id) {
        this.error(data, id);
        process.exit();
    }
    result(name, values, id) {
        this.log(`${colors.bgGreen(`[${name}] : `)}`, id);
        this.table(values);
    }
    table(values) {
        const table = new Table({
            head: Object.keys(values).map(value => colors.bold(value)),
        });
        table.push(Object.values(values));
        console.log(table);
    }
    /**
     * {@inheritdoc}
     */
    log(data, id, color) {
        const variables = [];
        if (id) {
            variables.push(`[${id}] `);
        }
        variables.push(data);
        if (color) {
            console.log(color(...variables));
        }
        else {
            console.log(...variables);
        }
    }
}
/**
 * Default logger class.
 */
export const WebAuditLogger = new LoggerClass();
