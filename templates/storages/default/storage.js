/**
 * <%= CamelName; %> class.
 */
class <%= CamelName; %>StorageClass {

    /**
     * {@inheritdoc}
     */
    get id() {
        return `<%= snake_name; %>`;
    }
    /**
     * {@inheritdoc}
     */

    get name() {
        return `<%= readable_name; %>`;
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
    installSchema(module, context) {
    }
    /**
     * Add data to Store
     */
    add(module, group_id, context, data) {
    }
    /**
     * Replace data.
     */
    one(module, group_id, context, data) {
    }
    /**
     * Add file.
     */
    file(module, input, context) {
    }
}

const storage = new <%= CamelName; %>StorageClass;
export default storage;
