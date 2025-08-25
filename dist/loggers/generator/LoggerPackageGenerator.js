import path from 'path';
import { generateFile } from '##/generators/GeneratorTools';
import { LoggerGenerator } from '##/loggers/generator/LoggerGenerator';
export class LoggerPackageGenerator extends LoggerGenerator {
    /**
     * {@inheritdoc}
     */
    async create(data) {
        const packageName = `web-audit-logger-${data.snake_name.split('_').join('-')}`;
        data.path = path.join(data.path, packageName);
        await super.create(data);
        await generateFile(`loggers/package/package.json`, `${data.path}/package.json`, data);
    }
}
