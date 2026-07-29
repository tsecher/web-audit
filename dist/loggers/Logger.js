import colors from 'colors';
import Table from 'cli-table3';
import { ModuleEvents } from '##/modules/ModuleInterface';
import targetHandler from '##/target/TargetHandler';
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
            const stored = data.data?.module || null;
            const summary = data.data.summary || null;
            const group_id = data.data.group_id || null;
            if (stored && summary) {
                this.onAnalyse(stored, group_id, context, summary);
            }
        });
    }
    onAnalyse(stored, group_id, context, result) {
        const parsedData = targetHandler.parseErrorData(stored, group_id, context, result);
        const summary = {};
        const labels = targetHandler.getStructureLabels(stored, group_id, context);
        Object.entries(parsedData.data).forEach(([id, data]) => {
            summary[labels[id]] = data.value;
        });
        this.result(group_id, summary, result.url);
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
        console.log(table.toString());
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
