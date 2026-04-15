// @ts-ignore
import fs from 'fs';
import path from 'path';

// @ts-ignore
import inquirer from 'inquirer';
// @ts-ignore
import ejs from 'ejs';

import {generateFile} from '##/generators/GeneratorTools';
import {LoggerGenerator} from '##/loggers/generator/LoggerGenerator';

export class LoggerPackageGenerator extends LoggerGenerator {

    /**
     * {@inheritdoc}
     */
    protected async create(data: any) {
        const packageName = `web-audit-logger-${data.snake_name.split('_').join('-')}`;
        data.path = path.join(data.path, packageName);

        await super.create(data);

        await generateFile(`loggers/package/package.json`, `${data.path}/package.json`, data);
    }
}
