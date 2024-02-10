import fs from 'fs';
import path from 'path';

import {AppConfig, AppConfigFileName} from '##/app/conf/AppConfig';
import {ModuleInterface} from '##/modules/ModuleInterface';

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
  public async getModules(force = false): Promise<ModuleInterface[]> {
    if (force || !this.modules) {
      await this.initModules();
    }

    return this.modules || [];
  }

  /**
   * Init modules.
   *
   * @protected
   */
  protected async initModules() {

    const modules: any = {};
    (await this.getModulesFromConfig())
      .map((module: ModuleInterface) => {
        modules[module.id] = module;
      });


    if (Object.keys(modules).length < 1) {
      throw new Error(`No modules defined. Please add modules in your ${AppConfigFileName}`);
    }

    this.modules = Object.values(modules);
  }

  /**
   * BUild the module list from module path.
   *
   * @param {string[]} moduleDataList
   * @returns {ModuleInterface[]}
   * @protected
   */
  protected async getModulesFromConfig(): Promise<ModuleInterface[]> {
    const moduleDataList = AppConfig.getConfig()?.modules;
    const modulesList: ModuleInterface[] = [];

    if (moduleDataList && moduleDataList.length) {
      for (const moduleData of moduleDataList) {
        const modulePath = path.resolve(process.cwd(), moduleData);
        if (fs.existsSync(modulePath)) {
          const ModuleClass = (await import(modulePath)).default;
          modulesList.push(new ModuleClass());
        }
      }
    }
    return modulesList;
  }
}

export const ModuleFinder = new ModuleFinderClass();
