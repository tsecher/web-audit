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
     * Init Store.
     */
    installStore(id, context, data) {
    }
    /**
     * Add data to Store
     *
     * @param id
     * @param context
     * @param data
     */
    add(id, context, data) {
    }
    /**
     * Replace data.
     */
    one(id, context, data) {
    }
    /**
     * Add file.
     *
     * @param {string} input
     * @param context
     */
    file(input, context) {
    }
}
