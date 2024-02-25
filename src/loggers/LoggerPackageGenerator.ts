// @ts-ignore
import fs from 'fs';
import path from 'path';

// @ts-ignore
import inquirer from 'inquirer';
// @ts-ignore
import ejs from 'ejs';

import {generateFile} from '##/generators/GeneratorTools';
import {LoggerGenerator} from '##/loggers/LoggerGenerator';

export class LoggerPackageGenerator extends LoggerGenerator {

  /**
   * {@inheritdoc}
   */
  protected async create(data: any) {
    const packageName = `web-audit-logger-${data.snake_name.split('_').join('-')}`;
    data.path = path.join(data.path, packageName);

    await super.create(data);

    await generateFile(`logger-packages/package.json`, `${data.path}/package.json`, data);
  }
}
