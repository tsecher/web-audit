/**
 * <%= CamelName; %> class.
 */
class <%= CamelName; %>Class {

	get id() {
		return `<%= snake_name; %>`;
	}

	get name() {
		return '<%= readable_name; %>';
	}

    prepare(context) {
		context.eventBus.on(ModuleEvents.onAnalyseSummary, (data) => {
			this.result(data.data.group_id, data.data.summary, data.data.url.url.toString());
		});
    }

	error(data, id) {
		this.log(data, id);
	}
	message(data, id) {
		this.log(data, id);
	}
	success(data, id) {
		this.log(data, id);
	}
	warning(data, id) {
		this.log(data, id);
	}
	exit(data, id) {
		this.error(data, id);
		process.exit();
	}
	result(name, values, id) {
		this.log(`${`[${name}] : `}`, id);
		console.table({ values }, Object.keys(values)
			.filter((item) => item !== 'url'));
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
	log(data, id) {
		const variables = [];
		if (id) {
			variables.push(`[${id}] `);
		}
		variables.push(data);
			console.log(...variables);
	}
}

const logger = new <%= CamelName; %>Class;
export default logger;
