import path from 'path';
import { generateFile } from '##/generators/GeneratorTools';
import { StorageGenerator } from '##/storage/generator/StorageGenerator';
export class StoragePackageGenerator extends StorageGenerator {
    /**
     * {@inheritdoc}
     */
    async create(data) {
        const packageName = `web-audit-storage-${data.snake_name.split('_').join('-')}`;
        data.path = path.join(data.path, packageName);
        await super.create(data);
        await generateFile(`storages/package/package.json`, `${data.path}/package.json`, data);
    }
}
