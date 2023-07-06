import fs from 'fs';

class AppConfigClass {

  protected config?: any;

  /**
   * Update the config.
   *
   * @param {string | object} input
   * @returns {this}
   */
  public setConfig(input: string | any) {
    if (typeof input === 'string') {
      if (fs.existsSync(input)) {
        this.config = JSON.parse(fs.readFileSync(input, 'utf-8'));
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
}

export const AppConfig: AppConfigClass = new AppConfigClass();
