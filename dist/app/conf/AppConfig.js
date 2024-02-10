import fs from 'fs';
class AppConfigClass {
    config;
    /**
     * Update the config.
     *
     * @param {string | object} input
     * @returns {this}
     */
    setConfig(input) {
        if (typeof input === 'string') {
            if (fs.existsSync(input)) {
                this.config = JSON.parse(fs.readFileSync(input, 'utf-8'));
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
}
export const AppConfig = new AppConfigClass();
export const AppConfigFileName = 'web-audit.config.json';
