// @ts-ignore
import path from 'path';
import { JourneyGenerator } from '##/journey/JourneyGenerator';
import { generateFile } from '##/generators/GeneratorTools';
export class JourneyPackageGenerator extends JourneyGenerator {
    /**
     * {@inheritdoc}
     */
    async create(data) {
        const packageName = `web-audit-journey-${data.snake_name.split('_').join('-')}`;
        data.path = path.join(data.path, packageName);
        await super.create(data);
        await generateFile(`journey-packages/package.json`, `${data.path}/package.json`, data);
    }
}
