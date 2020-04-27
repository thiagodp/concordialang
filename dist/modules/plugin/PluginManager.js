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
const childProcess = require("child_process");
const inquirer = require("inquirer");
const path_1 = require("path");
const PluginData_1 = require("./PluginData");
/**
 * Plug-in manager
 *
 * @author Thiago Delgado Pinto
 */
class PluginManager {
    constructor(_pluginListener, _finder, _fileReader) {
        this._pluginListener = _pluginListener;
        this._finder = _finder;
        this._fileReader = _fileReader;
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
    installByName(name) {
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
                    const content = yield this._fileReader.read(path);
                    if (!content) { // No package.json
                        mustGeneratePackageFile = true;
                        this._pluginListener.showMessagePackageFileNotFound(PACKAGE_FILE);
                    }
                }
                catch (err) {
                    mustGeneratePackageFile = true;
                }
                // Create package.json if it does not exist
                if (mustGeneratePackageFile) {
                    const code = yield this.runCommand(PACKAGE_CREATION_CMD);
                    this._pluginListener.showCommandCode(code, false);
                }
            }
            // Install the plug-in as a DEVELOPMENT dependency using NPM
            const PACKAGE_MANAGER = 'NPM';
            const INSTALL_DEV_CMD = 'npm install --save-dev ' + name + ' --no-fund --no-audit --loglevel error --color=always';
            this._pluginListener.showMessageTryingToInstall(name, PACKAGE_MANAGER);
            const code = yield this.runCommand(INSTALL_DEV_CMD);
            this._pluginListener.showCommandCode(code, false);
            if (code !== 0) { // unsuccessful
                return;
            }
            // Check if the plug-in is installed
            pluginData = yield this.pluginWithName(name, false);
            if (!pluginData) {
                this._pluginListener.showMessageCouldNoFindInstalledPlugin(name);
                return;
            }
        });
    }
    uninstallByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name.includes(PluginData_1.PLUGIN_PREFIX)) {
                name = PluginData_1.PLUGIN_PREFIX + name;
            }
            let pluginData = yield this.pluginWithName(name, false);
            if (!pluginData) {
                this._pluginListener.showMessagePluginNotFound(name);
                return;
            }
            // Remove with a package manager
            this._pluginListener.showMessageTryingToUninstall(name, 'NPM');
            let code = yield this.runCommand('npm uninstall --save-dev ' + name + ' --color=always');
            this._pluginListener.showCommandCode(code, true);
        });
    }
    serve(pluginData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pluginData.serve) {
                throw new Error('No "serve" property found in the plugin file. Can\'t serve.');
            }
            this._pluginListener.showPluginServeStart(pluginData.name);
            const code = yield this.runCommand(pluginData.serve);
            this._pluginListener.showCommandCode(code, true);
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
            this._pluginListener.showCommandStarted(command);
            let options = {
                // detached: true, // main process can terminate
                // stdio: 'ignore', // ignore stdio since detach is active
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
                    this._pluginListener.showCommandFinished();
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
     * @param className Class to be instantiated.
     * @param args Constructor arguments.
     * @return An instance of the given class.
     */
    createInstance(context, className, args) {
        return new context[className](...args);
    }
}
exports.PluginManager = PluginManager;
