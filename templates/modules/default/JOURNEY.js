import {AbstractPuppeteerJourneyModule} from 'web_audit/dist/journey/AbstractPuppeteerJourneyModule.js';
import {PuppeteerJourneyEvents} from 'web_audit/dist/journey/AbstractPuppeteerJourney.js';
import {ModuleEvents} from 'web_audit/dist/modules/ModuleInterface.js';

/**
 * <%= readable_name; %> Module events.
 */
export const <%= CamelName; %>ModuleEvents = {
	create<%= CamelName; %>Module: '<%= snake_name; %>_module__create<%= CamelName; %>Module',
	beforeAnalyse: '<%= snake_name; %>_module__beforeAnalyse',
	onResult: '<%= snake_name; %>_module__onResult',
	onResultDetail: '<%= snake_name; %>_module__onResultDetail',
	afterAnalyse: '<%= snake_name; %>_module__afterAnalyse',
};

/**
 * <%= readable_name; %>.
 */
export default class <%= CamelName; %>Module extends AbstractPuppeteerJourneyModule {
	get name() {
		return '<%= readable_name; %>';
	}

	get id() {
		return `<%= snake_name; %>`;
	}

	contextsData = {};

	/**
	 * {@inheritdoc}
	 */
	async init(context) {
		this.context = context;
		// Install <%= readable_name; %> store.
		this.context.config.storage?.installStore('<%= snake_name; %>', this.context, {
			url: 'Url',
			context: 'Context',
			// @TODO: Define storage
		});

		// Emit.
		this.context.eventBus.emit(<%= CamelName; %>ModuleEvents.create<%= CamelName; %>Module, {module: this});
	}

	/**
	 * {@inheritdoc}
	 */
	initEvents(journey) {
		journey.on(PuppeteerJourneyEvents.JOURNEY_START, async (data) => {
		    // @TODO : Add journey events.
		});
		journey.on(PuppeteerJourneyEvents.JOURNEY_NEW_CONTEXT, async (data) => {
		    this.contextsData[data.name] = this.getContextData(data);
		});
	}

	/**
	 * Return context data
	 */
	async getContextData(data) {

	}

	/**
	 * {@inheritdoc}
	 */
	async analyse(urlWrapper) {
		this.context?.eventBus.emit(ModuleEvents.startsComputing, {module: this});
		for (const contextName in this.contextsData) {
			if (contextName) {
				this.analyseContext(contextName, urlWrapper);
			}
		}
		this.context?.eventBus.emit(ModuleEvents.endsComputing, {module: this});
		return true;
	}


	/**
	 * Analyse a context.
	 *
	 * @param {string} contextName
	 * @param {UrlWrapper} urlWrapper
	 */
	analyseContext(contextName, urlWrapper) {

		const eventData = {
			module: this,
			url: urlWrapper,
		};
		this.context?.eventBus.emit(<%= CamelName; %>ModuleEvents.beforeAnalyse, eventData);
		this.context?.eventBus.emit(ModuleEvents.beforeAnalyse, eventData);

		// @TODO : Analyse

		// Event data.
		eventData.result = {
			url: urlWrapper.url.toString(),
			context: contextName,
			// @TODO: Add summary
		};
		this.context?.eventBus.emit(<%= CamelName; %>ModuleEvents.onResult, eventData);
		this.context?.config?.logger.result(`<%= readable_name; %>`, eventData.result, urlWrapper.url.toString());
		this.context?.config?.storage?.add('<%= snake_name; %>', this.context, eventData.result);
		this.context?.eventBus.emit(ModuleEvents.afterAnalyse, eventData);
		this.context?.eventBus.emit(<%= CamelName; %>ModuleEvents.afterAnalyse, eventData);
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
			"types": ["journey"], // ["page", "domain", "journey"]
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
