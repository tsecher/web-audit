// @ts-ignore
import fs from 'fs';
import path from 'path';

// @ts-ignore
import inquirer from 'inquirer';
// @ts-ignore
import ejs from 'ejs';

import {generateFile} from '##/generators/GeneratorTools';
import {StorageGenerator} from '##/storage/generator/StorageGenerator';

export class StoragePackageGenerator extends StorageGenerator {

  /**
   * {@inheritdoc}
   */
  protected async create(data: any) {
    const packageName = `web-audit-storage-${data.snake_name.split('_').join('-')}`;
    data.path = path.join(data.path, packageName);

    await super.create(data);

    await generateFile(`storages/package/package.json`, `${data.path}/package.json`, data);
  }
}
