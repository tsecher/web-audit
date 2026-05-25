import {AbstractDomainModule} from 'web_audit/dist/domain/AbstractDomainModule.js';
import {ModuleEvents} from 'web_audit/dist/modules/ModuleInterface.js';

/**
 * <%= readable_name; %> Module events.
 */
export const <%= CamelName; %>ModuleEvents = {
	create<%= CamelName; %>Module: '<%= snake_name; %>_module__create<%= CamelName; %>Module',
	onResult: '<%= snake_name; %>_module__onResult',
};

/**
 * <%= readable_name; %> Module.
 */
export default class <%= CamelName; %>Module extends AbstractDomainModule {

	/**
	 * {@inheritdoc}
	 */
	get name() {
		return '<%= readable_name; %>';
	}

	/**
	 * {@inheritdoc}
	 */
	get id() {
		return `<%= snake_name; %>`;
	}

	/**
	 * {@inheritdoc}
	 */
	async init(context) {
		this.context = context;

		// Install store.
		this.context.config.storage?.installSchema(this, this.context);;

		// Emit.
		this.context.eventBus.emit(<%= CamelName; %>ModuleEvents.create<%= CamelName; %>Module, {module: this});
	}

	/**
	 * {@inheritdoc}
	 */
	async analyseDomain(urlWrapper) {
		try {
			this.context?.eventBus.emit(ModuleEvents.startsComputing, {module: this});

			const result = await this.getBaseResult(urlWrapper.url.hostname);
			result.url = urlWrapper.url.hostname;

			const summary = {
				url: urlWrapper.url.hostname,
				// @TODO: build summary.
			};

			this.context?.eventBus.emit(<%= CamelName; %>ModuleEvents.onResult, {
				module: this,
				url: urlWrapper,
				result: result,
			});
			this.context?.eventBus.emit(ModuleEvents.onAnalyseResult, {module: this, url: urlWrapper, result: result});

			this.context?.config?.logger.result(`<%= readable_name; %>`, summary, urlWrapper.url.toString());
			this.context?.config?.storage?.one('<%= snake_name; %>', this.context, result);

			this.context?.eventBus.emit(ModuleEvents.endsComputing, {module: this});

			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Return base result.
	 * @param domain
	 * @returns {Promise<void>}
	 */
	async getBaseResult(domain) {
		// @TODO: Return domain data.
	}

	/**
	 * {@inheritdoc}
	 */
	finish() {
	}

	/**
	 * {@inheritdoc}
	 */
	getSchema() {
		// @Todo return the data schema.
		/*
		 * It is strongly recommended to return the content of an external json file.
		 * Here is the structure that must be returned (see "doc/module/schema.md")?
		 */
		return {
			"id": "<%= snake_name; %>",
			"label" : "<%= readable_name; %>",
			"description": "",
			"types": ["domain"], // ["page", "domain", "journey"]
			"structure": {
				"<%= snake_name; %>": {
					"label": "<%= readable_name; %>",
					"description": "",
					"structure": {
						// "data_1": {
						// 	"label": "Data 1",
						// 	"description": "Description of Data 1",
						// 	"type": "number",
						// 	"values": {
						// 		"goal": 1,
						// 		"default_threshold": 0.8
						// 	}
						// }
					}
				}
			}
		}
	}

}
