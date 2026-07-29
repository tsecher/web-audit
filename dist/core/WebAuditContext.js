/**
 * Context.
 */
export class WebAuditContextClass {
    config;
    eventBus;
    _id;
    _url;
    _data;
    _version;
    constructor(config, eventBus) {
        this.config = config;
        this.eventBus = eventBus;
    }
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
        this._version = version;
        return this;
    }
    prepare() {
        this.config.logger.prepare(this);
        this.config.storage.prepare(this);
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
        return this._version || '0';
    }
    /**
     * Check if context is same.
     * @param context
     */
    isSame(context) {
        return context?.id === this.id &&
            context?.url === this.url &&
            JSON.stringify(context?.data) === JSON.stringify(this.data);
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
