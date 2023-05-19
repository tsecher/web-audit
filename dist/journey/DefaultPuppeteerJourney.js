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
class DefaultPuppeteerJourney extends AbstractPuppeteerJourney_1.AbstractPuppeteerJourney {
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
            yield this.addStep('wait', () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.wait(1000);
            }));
            yield this.addStep('goto', () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.goto(url.url.toString());
            }));
            yield this.addStep('wait', () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.wait(1000);
            }));
            yield this.addStep('scrollToBottom', () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.scrollToBottom();
            }));
            yield this.addStep('finally wait', () => __awaiter(this, void 0, void 0, function* () {
                yield wrapper.wait(3000);
            }));
        });
    }
}
exports.DefaultPuppeteerJourney = DefaultPuppeteerJourney;
