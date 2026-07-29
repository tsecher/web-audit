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
    prepare(context) {
    }
    /**
     * {@inheritdoc}
     */
    init(urls, version) {
    }
    /**
     * Init Store with schema.
     */
    installSchema(stored, context) {
    }
    /**
     * Add data to Store
     */
    add(stored, group_id, context, data) {
    }
    /**
     * Replace data.
     */
    one(stored, group_id, context, data) {
    }
    /**
     * Add file.
     */
    file(stored, input, context) {
    }
}
