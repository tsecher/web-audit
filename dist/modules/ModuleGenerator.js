// @ts-ignore
import fs from 'fs';
import path from 'path';
import * as changeCase from 'change-case';
// @ts-ignore
import inquirer from 'inquirer';
import { MODULE_TYPES } from '##/modules/ModuleInterface';
import { generateFile } from '##/generators/GeneratorTools';
export class ModuleGenerator {
    getQuestions() {
        const questions = [
            {
                message: 'Readable name ?',
                name: 'readable_name',
            },
            {
                message: 'Module id (snake_case)?',
                name: 'snake_name',
                default: (values) => {
                    return changeCase.snakeCase(values.readable_name);
                },
            },
            {
                message: 'CamelCase name ?',
                name: 'CamelName',
                default: (values) => {
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
        const data = await inquirer.prompt(this.getQuestions());
        await this.create(data);
    }
    async create(data) {
        const dirpath = path.join(process.cwd(), data.path, 'src', 'modules');
        fs.mkdirSync(dirpath, { recursive: true });
        await generateFile(`modules/${data.type}.js`, path.join(dirpath, `${data.CamelName}Module.js`), data);
    }
}
