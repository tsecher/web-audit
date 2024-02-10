import path from 'path';
import { ModuleGenerator } from '##/modules/ModuleGenerator';
import { generateFile } from '##/generators/GeneratorTools';
export class ModulePackageGenerator extends ModuleGenerator {
    /**
     * {@inheritdoc}
     */
    async create(data) {
        const packageName = `web-audit-module-${data.snake_name.split('_').join('-')}`;
        data.path = path.join(data.path, packageName);
        await super.create(data);
        await generateFile(`module-packages/package.json`, `${data.path}/package.json`, data);
    }
}
