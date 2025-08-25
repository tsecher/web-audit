// @ts-ignore
import inquirer from 'inquirer';

import {ModuleGenerator} from '##/modules/generator/ModuleGenerator';
import {ModulePackageGenerator} from '##/modules/generator/ModulePackageGenerator';
import {JourneyGenerator} from '##/journey/generator/JourneyGenerator';
import {JourneyPackageGenerator} from '##/journey/generator/JourneyPackageGenerator';
import {LoggerGenerator} from '##/loggers/generator/LoggerGenerator';
import {LoggerPackageGenerator} from '##/loggers/generator/LoggerPackageGenerator';
import {CrawlerGenerator} from '##/crawlers/generator/CrawlerGenerator';
import {CrawlerPackageGenerator} from '##/crawlers/generator/CrawlerPackageGenerator';
import {StorageGenerator} from '##/storage/generator/StorageGenerator';
import {StoragePackageGenerator} from '##/storage/generator/StoragePackageGenerator';


const generators = [
  {
    name: 'Module',
    value: () => new ModuleGenerator(),
  },
  {
    name: 'Module Package',
    value: () => new ModulePackageGenerator(),
  },
  {
    name: 'Journey',
    value: () => new JourneyGenerator(),
  },
  {
    name: 'Journey Package',
    value: () => new JourneyPackageGenerator(),
  },
  {
    name: 'Logger',
    value: () => new LoggerGenerator(),
  },
  {
    name: 'Logger Package',
    value: () => new LoggerPackageGenerator(),
  },
  {
    name: 'Crawler',
    value: () => new CrawlerGenerator(),
  },
  {
    name: 'Crawler Package',
    value: () => new CrawlerPackageGenerator(),
  },
  {
    name: 'Storage',
    value: () => new StorageGenerator(),
  },
  {
    name: 'Storage Package',
    value: () => new StoragePackageGenerator(),
  },
];

const result = await inquirer.prompt({
  type: 'list',
  name: 'generator',
  message: `Generator type?`,
  choices: generators,
});

if (result.generator) {
  const generator = result.generator();
  await generator.generate();
}

