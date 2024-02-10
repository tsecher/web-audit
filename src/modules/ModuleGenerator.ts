// @ts-ignore
import fs from 'fs';
import path from 'path';

import * as changeCase from 'change-case';
// @ts-ignore
import inquirer from 'inquirer';


import {MODULE_TYPES} from '##/modules/ModuleInterface';
import {GeneratorInterface} from '##/generators/GeneratorInterface';
import {generateFile} from '##/generators/GeneratorTools';

export class ModuleGenerator implements GeneratorInterface {
  getQuestions(): any[] {
    const questions = [
      {
        message: 'Readable name ?',
        name: 'readable_name',
      },
      {
        message: 'Module id (snake_case)?',
        name: 'snake_name',
        default: (values: any) => {
          return changeCase.snakeCase(values.readable_name);
        },
      },
      {
        message: 'CamelCase name ?',
        name: 'CamelName',
        default: (values: any) => {
          return changeCase.pascalCase(values.readable_name);
        },
      },
      {
        message: `Directory (relative to ${process.cwd()})?`,
        name: 'path',
      },
      {
        type: 'list',
        message: 'Module type ? ',
        name: 'type',
        choices: Object.keys(MODULE_TYPES).map((type) => {
          return {
            name: MODULE_TYPES[type],
            value: type,
          };
        }),
      },
    ];

    return questions;
  }

  async generate() {
    const data: any = await inquirer.prompt(this.getQuestions());

    await this.create(data);
  }

  protected async create(data: any) {
    const dirpath = path.join(process.cwd(), data.path, 'src', 'modules');
    fs.mkdirSync(dirpath, {recursive: true});

    await generateFile(`modules/${data.type}.js`, path.join(dirpath, `${data.CamelName}Module.js`), data);
  }

}
