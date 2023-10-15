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
exports.AbstractDomainModule = void 0;
/**
 * Abstract domain module.
 */
class AbstractDomainModule {
    constructor() {
        this.cache = {};
    }
    analyseDomain(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAnalysableDomain(url.url.hostname)) {
                return this.analyse(url);
            }
            return true;
        });
    }
    /**
     * Return true if domain can be analysed.
     *
     * @param {string} domain
     * @returns {boolean}
     */
    isAnalysableDomain(domain) {
        const date = new Date().getTime() + 86400000;
        if (this.cache[domain] && this.cache[domain] < date) {
            return false;
        }
        else {
            this.cache[domain] = date;
        }
        return true;
    }
}
exports.AbstractDomainModule = AbstractDomainModule;
