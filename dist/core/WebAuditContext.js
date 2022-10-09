"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAuditContext = exports.WebAuditContextClass = void 0;
/**
 * Context.
 */
class WebAuditContextClass {
    setId(id) {
        this._id = id;
        return this;
    }
    setUrl(url) {
        this._url = url;
        return this;
    }
    setData(data) {
        this._data = data;
        return this;
    }
    setVersion(version) {
        if (typeof this._version !== 'undefined') {
            throw Error(`You cannot update context version anymore.`);
        }
        this._version = version;
        return this;
    }
    get id() {
        return this._id;
    }
    get url() {
        return this._url;
    }
    get data() {
        return this._data;
    }
    get version() {
        return this._version || 0;
    }
    /**
     * Check if context is same.
     * @param context
     */
    isSame(context) {
        return (context === null || context === void 0 ? void 0 : context.id) === this.id &&
            (context === null || context === void 0 ? void 0 : context.url) === this.url &&
            JSON.stringify(context === null || context === void 0 ? void 0 : context.data) === JSON.stringify(this.data);
    }
    /**
     * Readable context.
     */
    toString() {
        const tid = this.id || '';
        let tdata = '';
        if (this.data) {
            tdata += ` : ${typeof this.data === 'string' ? this.data : JSON.stringify(this.data)}`;
        }
        const turl = this.url ? `(${this.url})` : '';
        return `${tid} ${tdata} ${turl}`;
    }
}
exports.WebAuditContextClass = WebAuditContextClass;
/**
 * Context manager.
 */
exports.WebAuditContext = {
    current: new WebAuditContextClass(),
};
