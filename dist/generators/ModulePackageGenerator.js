import path from 'path';
import { ModuleGenerator } from '##/generators/ModuleGenerator';
export class ModulePackageGenerator extends ModuleGenerator {
    /**
     * {@inheritdoc}
     */
    create(data) {
        const packageName = `web-audit-module-${data.snake_name.split('_').join('-')}`;
        data.path = path.join(data.path, packageName);
        super.create(data);
        super.generateFile(`module-packages/package.json`, `${data.path}/package.json`, data);
    }
}
