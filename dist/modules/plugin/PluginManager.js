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
const JsonBasedPluginFinder_1 = require("./JsonBasedPluginFinder");
const path = require("path");
const childProcess = require("child_process");
/**
 * Plug-in manager
 *
 * @author Thiago Delgado Pinto
 */
class PluginManager {
    constructor(_pluginDir) {
        this._pluginDir = _pluginDir;
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const finder = new JsonBasedPluginFinder_1.JsonBasedPluginFinder(this._pluginDir);
            const all = yield finder.find();
            return this.sortByName(all);
        });
    }
    pluginWithName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const all = yield this.findAll();
            const withName = all.filter(v => v.name.toLowerCase() === name.toLowerCase());
            return withName.length > 0 ? withName[0] : null;
        });
    }
    install(pluginData, drawer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pluginData.install) {
                throw new Error('No "install" property found in the plugin file. Can\'t install it.');
            }
            drawer.showPluginInstallStart(pluginData.name);
            const code = yield this.runPluginCommand(pluginData.install, drawer);
        });
    }
    uninstall(pluginData, drawer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pluginData.uninstall) {
                throw new Error('No "uninstall" property found in the plugin file. Can\'t uninstall it.');
            }
            drawer.showPluginUninstallStart(pluginData.name);
            const code = yield this.runPluginCommand(pluginData.uninstall, drawer);
            drawer.showCommandCode(code);
        });
    }
    serve(pluginData, drawer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pluginData.serve) {
                throw new Error('No "serve" property found in the plugin file. Can\'t serve.');
            }
            drawer.showPluginServeStart(pluginData.name);
            const code = yield this.runPluginCommand(pluginData.serve, drawer);
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
            const pluginClassFile = path.resolve(this._pluginDir, pluginData.file);
            // Dynamically include the file
            const pluginClassFileContext = require(pluginClassFile);
            // Create an instance of the class
            const obj = this.createInstance(pluginClassFileContext, pluginData.class, []);
            return obj;
        });
    }
    runPluginCommand(command, drawer) {
        return __awaiter(this, void 0, void 0, function* () {
            const separationLine = '  ' + '_'.repeat(78);
            drawer.showCommand(command);
            drawer.write(separationLine);
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
//# sourceMappingURL=PluginManager.js.map