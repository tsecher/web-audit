// @ts-ignore
import inquirer from 'inquirer';

import {ModuleGenerator} from '##/modules/ModuleGenerator';
import {ModulePackageGenerator} from '##/modules/ModulePackageGenerator';
import {JourneyGenerator} from '##/journey/JourneyGenerator';
import {JourneyPackageGenerator} from '##/journey/JourneyPackageGenerator';


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

