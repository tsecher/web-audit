import colors from 'colors';
import Table from 'cli-table3';
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
        const table = new Table({
            head: Object.keys(values),
        });
        table.push(Object.values(values));
        console.log(table);
        // console.table({values}, Object.keys(values)
        //     .filter((item) => item !== 'url'));
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
