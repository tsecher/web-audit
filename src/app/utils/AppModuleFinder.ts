import fs from 'fs';
import path from 'path';

import {AppConfig} from '../conf/AppConfig';
import {ModuleInterface} from '../../modules/ModuleInterface';
import {LighthouseModule} from '../../modules/lighthouse/LighthouseModule';
import {EcoIndexModule} from '../../modules/ecoindex/EcoIndexModule';
import {CPUModule} from '../../modules/cpu/CPUModule';
import {W3cValidatorModule} from '../../modules/w3c/W3cValidatorModule';

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
  public getModules(force = false): ModuleInterface[] {
    if (force || !this.modules) {
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
    return [
      new LighthouseModule(),
      new EcoIndexModule(),
      new W3cValidatorModule(),
      new CPUModule(),
    ];
  }

  /**
   * Init modules.
   *
   * @protected
   */
  protected initModules() {

    const modules: any = {};
    this.getEmbedModules()
      .concat(this.getModulesFromConfig())
      .map((module: ModuleInterface) => {
        modules[module.id] = module;
      });

    this.modules = Object.values(modules);
  }

  /**
   * BUild the module list from module path.
   *
   * @param {string[]} moduleDataList
   * @returns {ModuleInterface[]}
   * @protected
   */
  protected getModulesFromConfig(): ModuleInterface[] {
    const moduleDataList = AppConfig.getConfig()?.modules;
    const modulesList: ModuleInterface[] = [];
    if (moduleDataList && moduleDataList.length) {
      for (const moduleData of moduleDataList) {
        const modulePath = path.resolve(process.cwd(), moduleData.path);
        if (fs.existsSync(modulePath)) {
          const ModuleClass = require(modulePath)[moduleData.id];
          modulesList.push(new ModuleClass());
        }
      }

    }
    return modulesList;
  }
}

export const ModuleFinder = new ModuleFinderClass();
