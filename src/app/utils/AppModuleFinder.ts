import fs from 'fs';
import path from 'path';

import {AppConfig} from '../conf/AppConfig';
import {ModuleInterface} from '../../modules/ModuleInterface';

/**
 * Find module according to configuration file.
 */
class ModuleFinderClass {

  protected modules?: ModuleInterface[];

  /**
   * Return the list of available modules.
   *
   * @returns {ModuleInterface[]}
   */
  public getModules(): ModuleInterface[] {
    if (!this.modules) {
      this.initModules();
    }

    return this.modules || [];
  }

  /**
   * Return all embed modules.
   *
   * @returns {ModuleInterface[]}
   * @protected
   */
  protected getEmbedModules(): ModuleInterface[] {
    return [];
  }

  /**
   * Init modules.
   *
   * @protected
   */
  protected initModules() {
    const moduleDataList = AppConfig.getConfig()?.modules;
    if (moduleDataList && moduleDataList.length) {
      this.modules = this.getModulesFromConfig(moduleDataList);
    } else {
      this.modules = this.getEmbedModules();
    }
  }

  /**
   * BUild the module list from module path.
   *
   * @param {string[]} moduleDataList
   * @returns {ModuleInterface[]}
   * @protected
   */
  protected getModulesFromConfig(moduleDataList: any[]): ModuleInterface[] {
    const modulesList: ModuleInterface[] = [];
    for (const moduleData of moduleDataList) {
      const modulePath = path.resolve(process.cwd(), moduleData.path);
      if (fs.existsSync(modulePath)) {
        const ModuleClass = require(modulePath)[moduleData.id];
        modulesList.push(new ModuleClass());
      }
    }

    return modulesList;
  }
}

export const ModuleFinder = new ModuleFinderClass();
