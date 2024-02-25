// @ts-ignore
import inquirer from 'inquirer';
import { ModuleGenerator } from '##/modules/ModuleGenerator';
import { ModulePackageGenerator } from '##/modules/ModulePackageGenerator';
import { JourneyGenerator } from '##/journey/JourneyGenerator';
import { JourneyPackageGenerator } from '##/journey/JourneyPackageGenerator';
import { LoggerGenerator } from '##/loggers/LoggerGenerator';
import { LoggerPackageGenerator } from '##/loggers/LoggerPackageGenerator';
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
