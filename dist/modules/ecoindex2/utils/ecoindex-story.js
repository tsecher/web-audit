"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcoindexStory = exports.ECOINDEX_STORY_EVENTS = void 0;
/**
 * Ecoindex story wrapper.
 */
const AbstractEventsClass_1 = require("../../../journey/AbstractEventsClass");
const ecoindex_data_handler_1 = require("./ecoindex-data-handler");
/**
 * Events.
 *
 * @type {{AFTER_INIT: string, PAGE_LOADED: string, AFTER_SCROLL: string, AFTER_VISIT: string}}
 */
exports.ECOINDEX_STORY_EVENTS = {
    AFTER_INIT: 'Ecoindex Story - After initialization',
    BEFORE_ADD_STEP: 'Ecoindex Story - Before add step',
    AFTER_ADD_STEP: 'Ecoindex Story - After add step',
};
/**
 * Step structure.
 */
class EcoindexStoryStep {
    constructor(name, ecoindex) {
        this.name = name;
        this.ecoindex = ecoindex;
        this.date = new Date();
    }
}
/**
 * Get the ecoindex raw data for a user story.
 */
class EcoindexStory extends AbstractEventsClass_1.AbstractEventsClass {
    constructor() {
        super(...arguments);
        this.steps = [];
    }
    /**
     * Return current step.
     */
    getCurrentStep() {
        return this.steps.length > 0 ? this.steps[this.steps.length - 1] : null;
    }
    /**
     * Initialize and start a story.
     *
     * @returns {Promise<void>}
     */
    start(page, conf = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign(Object.assign({}, ecoindex_data_handler_1.ECOINDEX_HANDLER_OPTIONS), conf);
            this.handler = new ecoindex_data_handler_1.EcoindexDataHandler(page, options);
            this.eventData = { page: page, options: options, handler: this.handler };
            yield this.handler.init();
            yield this.trigger(exports.ECOINDEX_STORY_EVENTS.AFTER_INIT, this.eventData);
            this.steps = [];
        });
    }
    /**
     * Add a new step in the story.
     */
    addStep(name) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.trigger(exports.ECOINDEX_STORY_EVENTS.BEFORE_ADD_STEP, this.eventData);
            const ecoindex = yield ((_a = this.handler) === null || _a === void 0 ? void 0 : _a.getRawResult());
            const step = new EcoindexStoryStep(name, ecoindex);
            this.steps.push(step);
            (_b = this.handler) === null || _b === void 0 ? void 0 : _b.clearResults();
            yield this.trigger(exports.ECOINDEX_STORY_EVENTS.AFTER_ADD_STEP, Object.assign(Object.assign({}, this.eventData), { step: step }));
        });
    }
    /**
     * Stop story logs.
     *
     * @returns {Promise<void>}
     */
    end(name) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addStep(name);
            return (_a = this.handler) === null || _a === void 0 ? void 0 : _a.stop();
        });
    }
    /**
     * Return data.
     *
     * @returns {EcoindexStoryStep[]}
     */
    getData() {
        return this.steps;
    }
}
exports.EcoindexStory = EcoindexStory;
