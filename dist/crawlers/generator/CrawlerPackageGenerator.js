// @ts-ignore
import path from 'path';
import { generateFile } from '##/generators/GeneratorTools';
import { CrawlerGenerator } from '##/crawlers/generator/CrawlerGenerator';
export class CrawlerPackageGenerator extends CrawlerGenerator {
    /**
     * {@inheritdoc}
     */
    async create(data) {
        const packageName = `web-audit-crawler-${data.snake_name.split('_').join('-')}`;
        data.path = path.join(data.path, packageName);
        await super.create(data);
        await generateFile(`crawlers/package/package.json`, `${data.path}/package.json`, data);
    }
}
