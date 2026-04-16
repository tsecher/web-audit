import fs from 'fs';

export class AppConfigClass {

    protected config?: any;

    /**
     * Update the config.
     *
     * @param {string | object} input
     * @returns {this}
     */
    public async setConfig(input: string | any) {
        if (typeof input === 'string') {
            if (fs.existsSync(input)) {
                try {
                    const data = await import(input);
                    this.config = data.config;
                } catch (err) {
                    this.config = {};
                }

            } else {
                this.config = {};
            }
        } else {
            this.config = input;
        }

        return this;
    }

    /**
     * Return the config.
     *
     * @returns {any}
     */
    public getConfig(): any | undefined {
        this.checkConfig();
        return this.config;
    }

    /**
     * Check config initialisation.
     *
     * @private
     */
    private checkConfig(): void {
        if (!this.config) {
            throw new Error(`No config file defined. Please use AppConfig.setConfig(configFilePath)`);
        }
    }

    /**
     * Add config to default one.
     *
     * @param conf
     */
    public addConfig(conf: any): void {
        if (Object.keys(conf).length) {
            this.deepMerge(this.config, conf);
        }
    }

    private deepMerge(destination: any, source: any) {
        Object.keys(source).forEach(key => {
            if (typeof destination[key] !== 'undefined') {
                if (this.isObject(destination[key]) && this.isObject(source[key])) {
                    this.deepMerge(destination[key], source[key]);
                    return;
                }
            }

            if (!this.isObject(destination[key])){
                destination[key] = source[key]
            }
        })
    }

    private isObject(item: any) {
        return typeof item === 'object' && item !== null && !Array.isArray(item);
    }
}

export const AppConfig: AppConfigClass = new AppConfigClass();
export const AppConfigFileName = 'web-audit.config.js';
