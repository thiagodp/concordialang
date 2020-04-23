import * as inquirer from 'inquirer';
import { Options } from '../app/Options';

export type GuidedConfigOptions = {
    directory: string;
    language: string;
    dirScripts: string;
    dirResults: string;
    plugin: string;
    pluginInstall: string;
};

/**
 * Guided Concordia configuration.
 */
export class GuidedConfig {

    async prompt(): Promise< GuidedConfigOptions > {

        const q = new ConcordiaQuestions();

        const questions = [
            q.directory(),
            q.language(),
            q.dirScripts(),
            q.dirResults(),
            q.plugin(),
            q.pluginInstall()
        ];

        return await inquirer.prompt( questions );
    }

}

class ConcordiaQuestions {

    // TO-DO: load language options dynamically
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

    dirScripts(): object {
        return {
            type: 'input',
            name: 'dirScripts',
            message: 'Where do you want to save generated test scripts?',
            default: './test'
        };
    }

    dirResults(): object {
        return {
            type: 'input',
            name: 'dirResults',
            message: 'Where do you want to save logs, screenshots, and report files?',
            default: './output'
        };
    }

    // TO-DO: load plug-in options dynamically
    plugin(): object {
        return {
            type: 'list',
            name: 'plugin',
            message: 'Which plug-in do you want to use?',
            choices: [
                { value: 'codeceptjs-webdriverio', short: 'codeceptjs-webdriverio', name: 'CodeceptJS with WebDriverIO (web applications)' },
                { value: 'codeceptjs-appium', short: 'codeceptjs-appium', name: 'CodeceptJS with Appium (mobile or desktop applications)' }
            ]
        };
    }

    pluginInstall(): object {
        return {
            type: 'confirm',
            name: 'pluginInstall',
            message: 'Do you want to download and install the plug-in?'
        };
    }

}