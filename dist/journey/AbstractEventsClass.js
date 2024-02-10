export class AbstractEventsClass {
    callbacks = {};
    /**
     * Listen events.
     *
     * @param {string} id
     * @param callback
     */
    on(id, callback) {
        this.callbacks[id] = this.callbacks[id] || [];
        this.callbacks[id].push(callback);
    }
    /**
     * Trigger events.
     *
     * @param {string} id
     * @param {{}} data
     * @returns {Promise<void>}
     */
    async trigger(id, data = {}) {
        for (const cb of this.callbacks[id] || []) {
            await cb(data);
        }
    }
}
