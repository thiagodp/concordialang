"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuidedConfig = void 0;
const inquirer = require("inquirer");
/**
 * Guided Concordia configuration.
 */
class GuidedConfig {
    prompt() {
        return __awaiter(this, void 0, void 0, function* () {
            const q = new ConcordiaQuestions();
            const questions = [
                q.directory(),
                q.language(),
                q.dirScript(),
                q.dirResult(),
                q.plugin(),
                q.pluginInstall(),
                q.databases()
            ];
            return yield inquirer.prompt(questions);
        });
    }
}
exports.GuidedConfig = GuidedConfig;
class ConcordiaQuestions {
    // TO-DO: load language options dynamically
    language() {
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
    directory() {
        return {
            type: 'input',
            name: 'directory',
            message: 'Where do you store specification files?',
            default: './features'
        };
    }
    dirScript() {
        return {
            type: 'input',
            name: 'dirScript',
            message: 'Where do you want to save generated test scripts?',
            default: './test'
        };
    }
    dirResult() {
        return {
            type: 'input',
            name: 'dirResult',
            message: 'Where do you want to save logs, screenshots, and report files?',
            default: './output'
        };
    }
    plugin() {
        return {
            type: 'list',
            name: 'plugin',
            message: 'Which plug-in do you want to use?',
            choices: [
                { value: 'codeceptjs-testcafe', short: 'codeceptjs-testcafe', name: 'CodeceptJS with TestCafé (web applications)' },
                { value: 'codeceptjs-playwright', short: 'codeceptjs-playwright', name: 'CodeceptJS with Playwright (web applications)' },
                { value: 'codeceptjs-webdriverio', short: 'codeceptjs-webdriverio', name: 'CodeceptJS with WebDriverIO (web applications)' },
                { value: 'codeceptjs-appium', short: 'codeceptjs-appium', name: 'CodeceptJS with Appium (mobile or desktop applications)' }
            ]
        };
    }
    pluginInstall() {
        return {
            type: 'confirm',
            name: 'pluginInstall',
            message: 'Do you want to download and install the plug-in?'
        };
    }
    databases() {
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
