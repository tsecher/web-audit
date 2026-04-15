import fs from 'fs';
export class AppConfigClass {
    config;
    /**
     * Update the config.
     *
     * @param {string | object} input
     * @returns {this}
     */
    async setConfig(input) {
        if (typeof input === 'string') {
            if (fs.existsSync(input)) {
                try {
                    const data = await import(input);
                    this.config = data.config;
                }
                catch (err) {
                    this.config = {};
                }
            }
            else {
                this.config = {};
            }
        }
        else {
            this.config = input;
        }
        return this;
    }
    /**
     * Return the config.
     *
     * @returns {any}
     */
    getConfig() {
        this.checkConfig();
        return this.config;
    }
    /**
     * Check config initialisation.
     *
     * @private
     */
    checkConfig() {
        if (!this.config) {
            throw new Error(`No config file defined. Please use AppConfig.setConfig(configFilePath)`);
        }
    }
    /**
     * Add config to default one.
     *
     * @param conf
     */
    addConfig(conf) {
        if (Object.keys(conf).length) {
            this.deepMerge(this.config, conf);
        }
    }
    deepMerge(destination, source) {
        Object.keys(source).forEach(key => {
            if (typeof destination[key] !== 'undefined') {
                if (this.isObject(destination[key]) && this.isObject(source[key])) {
                    this.deepMerge(destination[key], source[key]);
                    return;
                }
            }
            if (!this.isObject(destination[key])) {
                destination[key] = source[key];
            }
        });
    }
    isObject(item) {
        return typeof item === 'object' && item !== null;
    }
}
export const AppConfig = new AppConfigClass();
export const AppConfigFileName = 'web-audit.config.js';
