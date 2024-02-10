import { MODULE_TYPES } from '##/modules/ModuleInterface';
/**
 * Abstract domain module.
 */
export class AbstractDomainModule {
    cache = {};
    get type() {
        return MODULE_TYPES.BEFORE;
    }
    async analyse(url) {
        if (this.isAnalysableDomain(url.url.hostname)) {
            return this.analyseDomain(url);
        }
        return true;
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
