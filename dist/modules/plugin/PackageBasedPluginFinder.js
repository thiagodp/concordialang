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
const path_1 = require("path");
const fs = require("fs");
const util_1 = require("util");
const globalDirs = require("global-dirs");
const fwalker = require("fwalker");
const PluginData_1 = require("./PluginData");
const PackageToPluginData_1 = require("./PackageToPluginData");
/**
 * Finds plugins based on installed NodeJS packages.
 *
 * @author Thiago Delgado Pinto
 */
class PackageBasedPluginFinder {
    constructor(_processPath, _fs = fs) {
        this._processPath = _processPath;
        this._fs = _fs;
        this.NODE_MODULES = 'node_modules';
        this.PACKAGE_FILE = 'package.json';
    }
    /** @inheritdoc */
    find() {
        return __awaiter(this, void 0, void 0, function* () {
            const localPackagesDir = path_1.resolve(this._processPath, this.NODE_MODULES);
            // console.log( ' Finding at', localPackagesDir, '...' );
            const localPluginData = yield this.findOnDir(localPackagesDir);
            const globalPackagesDir = globalDirs.npm.packages;
            // console.log( ' Finding at', globalPackagesDir, '...' );
            const globalPluginData = yield this.findOnDir(globalPackagesDir);
            // console.log( 'Local', localPluginData.length, 'found. Global', globalPluginData.length, 'found.' );
            // Removes local packages from the global ones
            const globalNotInLocal = globalPluginData.filter(globalData => !localPluginData.find(localData => localData.name == globalData.name));
            return localPluginData.concat(globalNotInLocal);
        });
    }
    /** @inheritdoc */
    classFileFor(pluginData) {
        return __awaiter(this, void 0, void 0, function* () {
            // The property pluginData.file is changed when the file is loaded,
            // so it have the full path.
            return pluginData.file;
        });
    }
    /**
     * Finds Concordia plug-ins and returns their data.
     *
     * @param dir Directory to find.
     */
    findOnDir(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            let packageDirectories = [];
            try {
                packageDirectories = yield this.detectPluginPackageDirectories(dir);
            }
            catch (err) {
                if ('ENOENT' === err.code) {
                    return [];
                }
            }
            // console.log( 'Detected directories to analyze:', packageDirectories );
            const conversor = new PackageToPluginData_1.PackageToPluginData(PluginData_1.PLUGIN_PROPERTY);
            const readFile = util_1.promisify(this._fs.readFile);
            let allPluginData = [];
            for (const pkgDir of packageDirectories) {
                const pkgFile = path_1.join(pkgDir, this.PACKAGE_FILE);
                // console.log( 'Reading', pkgFile, '...' );
                let content;
                try {
                    content = yield readFile(pkgFile);
                }
                catch (err) {
                    if ('ENOENT' === err.code) {
                        continue; // Ignores a file that does not exist
                    }
                    throw new Error(`Cannot read plugin data from "${pkgFile}" because the file cannot be read. Details: ` + err.message);
                }
                const pkg = JSON.parse(content);
                // Ignores a package that does not have the expected property,
                // because it is not supposed to be a Concordia plugin.
                if (!pkg[PluginData_1.PLUGIN_PROPERTY]) {
                    // console.log( 'Current plug-in does not have the property "' + PLUGIN_PROPERTY + '".' );
                    continue;
                }
                const pluginData = conversor.convert(pkg);
                if (!pluginData) {
                    // continue; // Cannot convert to plugin data
                    throw new Error(`Cannot convert package file "${pkgFile}" to plugin data. `);
                }
                // Modifies the `file` property to contain the full path
                let file = pluginData.file;
                if (!file) {
                    throw new Error(`Package file "${pkgFile}" does not have a property "${PluginData_1.PLUGIN_PROPERTY}.file".`);
                }
                if (file.indexOf(pluginData.name) < 0) {
                    file = path_1.join(dir, pluginData.name, file);
                }
                else {
                    file = path_1.join(dir, file);
                }
                pluginData.file = file;
                allPluginData.push(pluginData);
            }
            return allPluginData;
        });
    }
    /**
     * Detects Concordia plug-ins' directories, i.e.,  starting with `concordialang-'.
     *
     * @param dir Directory to find.
     */
    detectPluginPackageDirectories(dir) {
        return new Promise((resolve, reject) => {
            let directories = [];
            const dirRegExp = new RegExp(PluginData_1.PLUGIN_PREFIX);
            const onDir = (path, stats, absPath) => {
                // Ignore directories that do not match the prefix
                if (!dirRegExp.test(path)) {
                    return;
                }
                directories.push(absPath);
            };
            const options = {
                recursive: false,
                maxAttempts: 1,
                fs: this._fs
            };
            fwalker(dir, options)
                .on('dir', onDir)
                .on('error', (err) => reject(err))
                .on('done', () => resolve(directories))
                .walk();
        });
    }
}
exports.PackageBasedPluginFinder = PackageBasedPluginFinder;
