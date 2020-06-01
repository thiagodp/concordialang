import * as inquirer from 'inquirer';

export type GuidedConfigOptions = {
    directory: string;
    language: string;
    dirScripts: string;
    dirResults: string;
    plugin: string;
    pluginInstall: string;
    databases: string[];
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
            q.pluginInstall(),
            q.databases()
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

    plugin(): object {
        return {
            type: 'list',
            name: 'plugin',
            message: 'Which plug-in do you want to use?',
            choices: [
                { value: 'codeceptjs-playwright', short: 'codeceptjs-playwright', name: 'CodeceptJS with Playwright (web applications)' },
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

    databases(): object {

        const choices = [
            { value: 'database-js-csv', name: 'CSV files' },
            { value: 'database-js-xlsx', name: 'Excel files' },
            { value: 'database-js-firebase', name: 'Firebase databases' },
            { value: 'database-js-ini', name: 'Ini files' },
            { value: 'database-js-json', name: 'JSON files' },
            { value: 'database-js-mysql', name: 'MySQL databases' },
            { value: 'database-js-adodb', name: 'MS Access databases (Windows only)' },
            { value: 'database-js-mssql', name: 'MS SQL Server databases' },
            { value: 'database-js-postgres', name: 'PostgreSQL' },
            { value: 'database-js-sqlite', name: 'SQLite' },
        ];

        return {
            type: 'checkbox',
            name: 'databases',
            message: 'Which databases do you want to use in your tests?',
            choices: choices,
            pageSize: choices.length
        };
    }

}