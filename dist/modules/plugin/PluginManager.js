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
const childProcess = require("child_process");
const inquirer = require("inquirer");
const fs = require("fs");
const path_1 = require("path");
const PluginData_1 = require("./PluginData");
const read_file_1 = require("../util/read-file");
/**
 * Plug-in manager
 *
 * @author Thiago Delgado Pinto
 */
class PluginManager {
    constructor(_cli, _finder, _fs = fs) {
        this._cli = _cli;
        this._finder = _finder;
        this._fs = _fs;
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const all = yield this._finder.find();
            return this.sortByName(all);
        });
    }
    pluginWithName(name, partialComparison = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const usualComparison = (from, to) => {
                return (from === to)
                    || (from === PluginData_1.PLUGIN_PREFIX + to)
                    || (PluginData_1.PLUGIN_PREFIX + from === to);
            };
            const removeVersionFromName = (name) => {
                const index = name.lastIndexOf('@');
                if (index < 0) {
                    return name;
                }
                return name.substring(0, index);
            };
            const compareNames = (from, to, partialComparison) => {
                if (partialComparison) {
                    return from.includes(to);
                }
                if (usualComparison(from, to)) {
                    return true;
                }
                return usualComparison(removeVersionFromName(from), removeVersionFromName(to));
            };
            const all = yield this.findAll();
            const lowerCasedName = name.toLowerCase();
            const withName = all.filter(v => compareNames(v.name.toLowerCase(), lowerCasedName, partialComparison));
            return withName.length > 0 ? withName[0] : null;
        });
    }
    installByName(name, drawer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name.includes(PluginData_1.PLUGIN_PREFIX)) {
                name = PluginData_1.PLUGIN_PREFIX + name;
            }
            let pluginData = yield this.pluginWithName(name, false);
            if (pluginData) { // already exists
                let answer = yield inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'install',
                        message: 'Plug-in already installed. Do you want to try to install it again?'
                    }
                ]);
                if (!answer.install) {
                    return;
                }
            }
            else { // plug-in does not exist
                // Check if package.json exists
                const PACKAGE_FILE = 'package.json';
                const PACKAGE_CREATION_CMD = 'npm init --yes';
                let mustGeneratePackageFile = false;
                try {
                    const path = path_1.join(process.cwd(), PACKAGE_FILE);
                    const content = yield read_file_1.readFileAsync(path, { fs: this._fs, silentIfNotExists: true });
                    if (!content) { // No package.json
                        mustGeneratePackageFile = true;
                        drawer.showMessagePackageFileNotFound(PACKAGE_FILE);
                    }
                }
                catch (err) {
                    mustGeneratePackageFile = true;
                }
                // Create package.json if it does not exist
                if (mustGeneratePackageFile) {
                    const code = yield this.runCommand(PACKAGE_CREATION_CMD);
                    drawer.showCommandCode(code, false);
                }
            }
            // Install the plug-in as a DEVELOPMENT dependency using NPM
            const PACKAGE_MANAGER = 'NPM';
            const INSTALL_DEV_CMD = 'npm install --save-dev ' + name + ' --color=always';
            drawer.showMessageTryingToInstall(name, PACKAGE_MANAGER);
            const code = yield this.runCommand(INSTALL_DEV_CMD);
            drawer.showCommandCode(code, false);
            if (code !== 0) { // unsuccessful
                return;
            }
            // Check if the plug-in is installed
            pluginData = yield this.pluginWithName(name, false);
            if (!pluginData) {
                drawer.showMessageCouldNoFindInstalledPlugin(name);
                return;
            }
        });
    }
    uninstallByName(name, drawer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name.includes(PluginData_1.PLUGIN_PREFIX)) {
                name = PluginData_1.PLUGIN_PREFIX + name;
            }
            let pluginData = yield this.pluginWithName(name, false);
            if (!pluginData) {
                drawer.showMessagePluginNotFound(name);
                return;
            }
            // Remove with a package manager
            drawer.showMessageTryingToUninstall(name, 'NPM');
            let code = yield this.runCommand('npm uninstall --save-dev ' + name + ' --color=always');
            drawer.showCommandCode(code);
        });
    }
    serve(pluginData, drawer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pluginData.serve) {
                throw new Error('No "serve" property found in the plugin file. Can\'t serve.');
            }
            drawer.showPluginServeStart(pluginData.name);
            const code = yield this.runCommand(pluginData.serve);
            drawer.showCommandCode(code);
        });
    }
    /**
     * Tries to load a plug-in and to return its instance.
     *
     * @param pluginData Plug-in data
     */
    load(pluginData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pluginClassFile = yield this._finder.classFileFor(pluginData);
            // Dynamically include the file
            const pluginClassFileContext = require(pluginClassFile);
            // Create an instance of the class
            const obj = this.createInstance(pluginClassFileContext, pluginData.class, []);
            return obj;
        });
    }
    runCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const separationLine = '  ' + '_'.repeat(78);
            this._cli.newLine('  Running', this._cli.colorHighlight(command));
            this._cli.newLine(separationLine);
            let options = {
                // detached: true, // main process can terminate
                // stdio: 'ignore', // ignore stdio since detache is active
                shell: true,
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
                // Executing
                const child = childProcess.spawn(runCMD, cmds, options);
                child.stdout.on('data', (chunk) => {
                    console.log(chunk.toString());
                });
                child.stderr.on('data', (chunk) => {
                    console.warn(chunk.toString());
                });
                child.on('exit', (code) => {
                    console.log(separationLine);
                    resolve(code);
                });
            });
        });
    }
    sortByName(plugins) {
        return plugins.sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        });
    }
    /**
     * Returns an instance of a given class name.
     *
     * @param context Object used as context.
     * @param className Class to be instantied.
     * @param args Constructor arguments.
     * @return An instance of the given class.
     */
    createInstance(context, className, args) {
        return new context[className](...args);
    }
}
exports.PluginManager = PluginManager;
