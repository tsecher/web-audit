// @ts-ignore
import fs from 'fs';
import path from 'path';

import * as changeCase from 'change-case';
// @ts-ignore
import inquirer from 'inquirer';
// @ts-ignore
import ejs from 'ejs';

import {GeneratorInterface} from '##/generators/GeneratorInterface';
import {generateFile} from '##/generators/GeneratorTools';

export class JourneyGenerator implements GeneratorInterface {
  getQuestions(): any[] {
    const questions = [
      {
        message: 'Readable name ?',
        name: 'readable_name',
      },
      {
        message: 'Journey id (snake_case)?',
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
    ];

    return questions;
  }

  async generate() {
    const data: any = await inquirer.prompt(this.getQuestions());

    this.create(data);
  }

  protected async create(data: any) {
    const dirpath = path.join(process.cwd(), data.path, 'src', 'journeys');
    fs.mkdirSync(dirpath, {recursive: true});

    await generateFile(`journeys/journey.js`, path.join(dirpath, `${data.CamelName}Journey.js`), data);
  }

}
