"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fse = require("node-fs-extra");
const childProcess = require("child_process");
const util_1 = require("util");
const fs_1 = require("fs");
const ConfigMaker_1 = require("./ConfigMaker");
const chalk_1 = require("chalk");
const figures_1 = require("figures");
/**
 * Executes test scripts generated by Concordia using CodeceptJS.
 */
class TestScriptExecutor {
    constructor(_defaultConfig) {
        this._defaultConfig = _defaultConfig;
    }
    /**
     * Executes the script according to the options given.
     *
     * @param options Execution options
     */
    execute(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const iconInfo = chalk_1.default.blueBright(figures_1.info);
            const iconArrow = chalk_1.default.yellow(figures_1.arrowRight);
            const iconError = chalk_1.default.redBright(figures_1.cross);
            const iconWarning = chalk_1.default.yellow(figures_1.warning);
            const textColor = chalk_1.default.cyanBright;
            const textCommand = chalk_1.default.cyan;
            const highlight = chalk_1.default.yellowBright;
            if (!!options.sourceCodeDir) {
                fse.mkdirs(options.sourceCodeDir);
            }
            if (!!options.executionResultDir) {
                fse.mkdirs(options.executionResultDir);
            }
            const executionPath = process.cwd();
            const cfgMaker = new ConfigMaker_1.ConfigMaker();
            const writeF = util_1.promisify(fs_1.writeFile);
            // About codeceptj.json ------------------------------------------------
            const CONFIG_FILE_NAME = 'codecept.json';
            const configFilePath = path.join(executionPath, CONFIG_FILE_NAME);
            let configFileExists = yield this.fileExists(configFilePath);
            // if ( ! configFileExists ) {
            //     // await this.runCommand( 'codeceptjs init' );
            //     try {
            //         const cmd = 'codeceptjs init';
            //         this.write( '  PLUGIN: No CodeceptJS configuration found. Let\'s make one!' );
            //         this.write( '  PLUGIN:', cmd );
            //         childProcess.execSync( cmd, { stdio: [ 0, 1, 2 ] } );
            //     } catch ( e ) {
            //         console.error( '  PLUGIN:', e.message );
            //     }
            // }
            // configFileExists = await this.fileExists( configFilePath );
            // It's only possible to run CodeceptJS if there is a config file
            if (!configFileExists) {
                try {
                    yield writeF(configFilePath, JSON.stringify(this._defaultConfig, undefined, "\t"));
                    this.write(iconInfo, textColor('Generated configuration file'), highlight(configFilePath));
                    this.write(figures_1.arrowRight, textColor('If this file does not work for you, delete it and then run:'));
                    this.write(textColor('  codeceptjs init'));
                }
                catch (e) {
                    this.write(iconError, textColor('Could not generate'), highlight(configFilePath) + '.', textColor('Please run the following command:'));
                    this.write(textColor('  codeceptjs init'));
                }
            }
            else {
                // Let's check needed dependencies
                let config = {};
                let hadReadError = false;
                try {
                    const readF = util_1.promisify(fs_1.readFile);
                    const content = yield readF(configFilePath);
                    config = JSON.parse(content.toString());
                    this.write(iconInfo, textColor('Read'), highlight(configFilePath));
                }
                catch (e) {
                    hadReadError = true;
                    this.write(iconError, textColor('Could not read'), highlight(configFilePath));
                }
                if (!hadReadError) {
                    let needsToWriteConfig = !cfgMaker.hasHelpersProperty(config);
                    if (!cfgMaker.hasCmdHelper(config)) {
                        cfgMaker.setCmdHelper(config);
                        needsToWriteConfig = true;
                    }
                    if (!cfgMaker.hasDbHelper(config)) {
                        cfgMaker.setDbHelper(config);
                        needsToWriteConfig = true;
                    }
                    if (needsToWriteConfig) {
                        try {
                            yield writeF(configFilePath, JSON.stringify(config));
                            this.write(iconInfo, textColor('Updated configuration file'), highlight(configFilePath));
                        }
                        catch (e) {
                            this.write(iconError, textColor('Error updating configuration file'), highlight(configFilePath) + '. Please check if it has DbHelper and CmdHelper configured.');
                        }
                    }
                }
            }
            // About package.json --------------------------------------------------
            const PROJECT_FILE_NAME = 'package.json';
            const packageFilePath = path.join(executionPath, PROJECT_FILE_NAME);
            let showOptionalPackages = false;
            const packageFileExists = yield this.fileExists(packageFilePath);
            const neededPackages = [
                'mocha',
                'mocha-multi',
                'codeceptjs',
                'codeceptjs-cmdhelper',
                'codeceptjs-dbhelper',
                'database-js',
                'database-js-json'
            ];
            let hasCodeceptScriptInPackage = false;
            // Creating package.json if it does not exist
            if (!packageFileExists) {
                this.write(iconInfo, textColor('Creating'), highlight(PROJECT_FILE_NAME), textColor('with needed dependencies...'));
                const cmd1 = 'npm init --yes';
                this.write(' ', textCommand(cmd1));
                yield this.runCommand(cmd1);
                const cmd2 = 'npm install --save-dev ' + neededPackages.join(' ');
                this.write(' ', textCommand(cmd2));
                yield this.runCommand(cmd2);
                showOptionalPackages = true;
            }
            // Reading package.json
            let pkg = {};
            try {
                const readF = util_1.promisify(fs_1.readFile);
                const content = yield readF(packageFilePath);
                pkg = JSON.parse(content.toString());
            }
            catch (e) {
                // Need to do nothing since pkg stay empty
            }
            // Evaluate property "devDependencies" of package.json
            const DEV_DEPENDENCIES_PROPERTY = 'devDependencies';
            const devDependencies = pkg[DEV_DEPENDENCIES_PROPERTY];
            if (!devDependencies) {
                this.write(iconWarning, 'Could not read', highlight(packageFilePath) + '.');
                this.write(iconArrow, 'Please check if it has the following packages in the property "' + highlight(DEV_DEPENDENCIES_PROPERTY) + '":');
                neededPackages.forEach(v => this.write('  ', v));
                showOptionalPackages = true;
            }
            else {
                // Check needed packages
                let packagesNotFound = [];
                for (let np of neededPackages) {
                    if (!devDependencies[np]) {
                        packagesNotFound.push(np);
                    }
                }
                // Install the packages that were not found
                if (packagesNotFound.length > 0) {
                    this.write(iconInfo, textColor('Installing needed dependencies...'));
                    const cmd = 'npm install --save-dev ' + packagesNotFound.join(' ');
                    this.write(' ', textCommand(cmd));
                    yield this.runCommand(cmd);
                    showOptionalPackages = true;
                }
            }
            // Evaluate property "scripts" of package.json
            const SCRIPTS_PROPERTY = 'scripts';
            const scripts = pkg[SCRIPTS_PROPERTY];
            if (!scripts) {
                pkg[SCRIPTS_PROPERTY] = {};
            }
            const CODECEPTJS_SCRIPT_PROPERTY = 'concordia:codeceptjs';
            if (!pkg[SCRIPTS_PROPERTY][CODECEPTJS_SCRIPT_PROPERTY]) {
                pkg[SCRIPTS_PROPERTY][CODECEPTJS_SCRIPT_PROPERTY] = 'codeceptjs run --reporter mocha-multi --colors';
                // Overwrite package.json
                try {
                    yield writeF(packageFilePath, JSON.stringify(pkg, undefined, "\t"));
                    hasCodeceptScriptInPackage = true;
                }
                catch (e) {
                    this.write(iconError, 'Error: could not write package.json');
                }
            }
            else {
                hasCodeceptScriptInPackage = true;
            }
            // Show optional packages
            if (showOptionalPackages) {
                this.write(iconInfo, textColor('For supporting other databases, please run:'));
                this.write(' ', textColor('npm install --save-dev database-js-csv database-js-xlsx database-js-ini database-js-firebase database-js-mysql database-js-postgres database-js-sqlite\n'));
            }
            // Run CodeceptJS ------------------------------------------------------
            const OUTPUT_FILE_NAME = 'output.json';
            const outputFilePath = path.join(options.executionResultDir || '.', OUTPUT_FILE_NAME);
            this.write(iconInfo, textColor('Running tests...'));
            const cmd = hasCodeceptScriptInPackage
                ? 'npm run concordia:codeceptjs'
                : `codeceptjs run --steps --reporter mocha-multi --config ${configFilePath} --colors`;
            this.write(' ', textCommand(cmd));
            const code = yield this.runCommand(cmd);
            return outputFilePath;
        });
    }
    fileExists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accessFile = util_1.promisify(fs_1.access);
                yield accessFile(path, fs_1.constants.F_OK);
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
    // /**
    //  * Generates a command that calls CodeceptJS and can be executed in a terminal.
    //  *
    //  * @param options Execution options
    //  * @param outputFile Output file where test results will be written
    //  * @throws Error
    //  */
    // public generateTestCommand( options: TestScriptExecutionOptions, outputFile: string ): string {
    //     if ( ! options.sourceCodeDir ) {
    //         throw new Error( 'Source code directory is missing!' );
    //     }
    //     if ( ! options.executionResultDir ) {
    //         throw new Error( 'Execution result directory is missing!' );
    //     }
    //     const commandOptions: object = new CodeceptJSOptionsBuilder()
    //         .withOutputFile( outputFile )
    //         .value(); //TODO: Accept CodeceptJS options.
    //     const optionsStr: string = this.escapeJson( JSON.stringify( commandOptions ) );
    //     return `codeceptjs run --reporter mocha-multi --override "${optionsStr}" -c ${ options.sourceCodeDir } --colors`;
    // }
    escapeJson(json) {
        return JSON.stringify({ _: json }).slice(6, -2);
    }
    runCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                // stdio: 'inherit', // <<< not working on windows!
                shell: true
            };
            // Splits the command into pieces to pass to the process;
            //  mapping function simply removes quotes from each piece
            let cmds = command.match(/[^"\s]+|"(?:\\"|[^"])+"/g)
                .map(expr => {
                return expr.charAt(0) === '"' && expr.charAt(expr.length - 1) === '"' ? expr.slice(1, -1) : expr;
            });
            const runCMD = cmds[0];
            cmds.shift();
            return new Promise((resolve, reject) => {
                const child = childProcess.spawn(runCMD, cmds, options);
                child.stdout.on('data', (chunk) => {
                    console.log(chunk.toString());
                });
                child.stderr.on('data', (chunk) => {
                    console.warn(chunk.toString());
                });
                child.on('exit', (code) => {
                    resolve(code);
                });
            });
        });
    }
    write(...args) {
        console.log(...args);
    }
}
exports.TestScriptExecutor = TestScriptExecutor;
