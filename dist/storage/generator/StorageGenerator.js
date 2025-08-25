// @ts-ignore
import fs from 'fs';
import path from 'path';
import * as changeCase from 'change-case';
// @ts-ignore
import inquirer from 'inquirer';
import { generateFile } from '##/generators/GeneratorTools';
export class StorageGenerator {
    getQuestions() {
        const questions = [
            {
                message: 'Readable name ?',
                name: 'readable_name',
            },
            {
                message: 'Storage id (snake_case)?',
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
        ];
        return questions;
    }
    async generate() {
        const data = await inquirer.prompt(this.getQuestions());
        await this.create(data);
    }
    async create(data) {
        const dirpath = path.join(process.cwd(), data.path, 'src', 'storages');
        fs.mkdirSync(dirpath, { recursive: true });
        await generateFile(`storages/default/storage.js`, path.join(dirpath, `${data.CamelName}Storage.js`), data);
    }
}
