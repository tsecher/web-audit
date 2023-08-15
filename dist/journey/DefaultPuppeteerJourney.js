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
exports.DefaultPuppeteerJourney = void 0;
const AbstractPuppeteerJourney_1 = require("./AbstractPuppeteerJourney");
/**
 * Default journey.
 *
 *  1. Go to URL
 *  2. Wait load
 *  3. Scroll to bottom
 *  4. Wait load
 */
class DefaultPuppeteerJourney extends AbstractPuppeteerJourney_1.AbstractPuppeteerJourney {
    /**
     * {@inheritdoc}
     */
    get id() {
        return 'default_journey';
    }
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'Default journey';
    }
    /**
     * {@inheritdoc}
     */
    init(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve();
        });
    }
    /**
     * {@inheritdoc}
     */
    journey(wrapper, url) {
        return __awaiter(this, void 0, void 0, function* () {
            const wait = 1000;
            let i;
            yield this.addStep(`Go to ${url.url.toString()}`, () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.goto(url.url.toString());
            }));
            yield this.addStep(`Wait 1s`, () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.wait(Number(wait));
            }));
            yield this.addStep('Scroll to bottom', () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.scrollToBottom();
            }));
            yield this.addStep('Finally wait 3s', () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.wait(3 * wait);
            }));
            yield this.triggerNewContext('Visit and scroll');
        });
    }
}
exports.DefaultPuppeteerJourney = DefaultPuppeteerJourney;
