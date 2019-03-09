import * as inquirer from 'inquirer';
import { Options } from './Options';

/**
 * Guided Concordia configuration.
 */
export class GuidedConfig {

    async prompt( options: Options ): Promise< Options > {

        const q = new ConcordiaQuestions();

        const questions = [
            q.directory(),
            q.language(),
            q.dirScript(),
            q.dirResult(),
            q.plugin()
        ];

        let r = await inquirer.prompt( questions );

        options.directory = r.directory;
        options.language = r.language;
        options.dirScript = r.dirScript;
        options.dirResult = r.dirResult;
        options.plugin = r.plugin;

        return options;
    }
}

class ConcordiaQuestions {

    // TO-DO: load options dynamically
    language(): object {
        return {
            type: 'list',
            name: 'language',
            message: 'Which spoken language do you want to use in specification files?',
            choices: [
                { value: 'en', short: 'en', name: 'English (en)' },
                { value: 'pt', short: 'pt', name: 'Portuguese (pt)' }
            ]
        };
    }

    directory(): object {
        return {
            type: 'input',
            name: 'directory',
            message: 'Where do you store specification files?',
            default: './features'
        };
    }

    dirScript(): object {
        return {
            type: 'input',
            name: 'dirScript',
            message: 'Where do you want to save generated test scripts?',
            default: './test'
        };
    }

    dirResult(): object {
        return {
            type: 'input',
            name: 'dirResult',
            message: 'Where do you want to save logs, screenshots, and report files?',
            default: './output'
        };
    }

    // TO-DO: load options dynamically
    plugin(): object {
        return {
            type: 'list',
            name: 'plugin',
            message: 'Which plug-in do you want to use?',
            choices: [
                { value: 'codeceptjs', short: 'codeceptjs', name: 'CodeceptJS with WebDriverIO (web applications)' },
                { value: 'codeceptjs-appium', short: 'codeceptjs-appium', name: 'CodeceptJS with Appium (mobile or desktop applications)' }
            ]
        };
    }

};