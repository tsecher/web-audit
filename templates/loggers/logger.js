import colors from 'colors';
/**
 * <%= CamelName; %> class.
 */
export default class <%= CamelName; %>Class {

	get id() {
		return `<%= snake_name; %>`;
	}

	get name() {
		return '<%= readable_name; %>';
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
		console.table({ values }, Object.keys(values)
			.filter((item) => item !== 'url'));
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

