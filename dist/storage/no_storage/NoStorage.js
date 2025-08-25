/**
 * store data in
 */
export default class NoStorage {
    /**
     * {@inheritdoc}
     */
    get id() {
        return 'no_storage';
    }
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'No storage';
    }
    /**
     * {@inheritdoc}
     */
    init(urls, version) {
    }
    /**
     * Init Store with schema.
     */
    installSchema(id, context, schema) {
    }
    /**
     * Add data to Store
     *
     * @param id
     * @param context
     * @param data
     * @param module
     */
    add(id, context, data, module) {
    }
    /**
     * Replace data.
     */
    one(id, context, data, module) {
    }
    /**
     * Add file.
     *
     * @param {string} input
     * @param context
     * @param module
     */
    file(input, context, module) {
    }
}
