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
const path_1 = require("path");
const fs = require("fs");
const util_1 = require("util");
const globalDirs = require("global-dirs");
const fwalker = require("fwalker");
const PackageToPluginData_1 = require("./PackageToPluginData");
/**
 * Finds plugins based on installed NodeJS packages.
 *
 * @author Thiago Delgado Pinto
 */
class PackageBasedPluginFinder {
    constructor(_appPath, _fs = fs) {
        this._appPath = _appPath;
        this._fs = _fs;
        this.PLUGIN_PACKAGE_PREFIX = 'concordialang-';
        this.NODE_MODULES = 'node_modules';
        this.PACKAGE_FILE = 'package.json';
        this.PACKAGE_PROPERTY = 'concordiaPluginData';
    }
    /** @inheritdoc */
    find() {
        return __awaiter(this, void 0, void 0, function* () {
            const localPackagesDir = path_1.resolve(this._appPath, this.NODE_MODULES);
            const localPluginData = yield this.findOnDir(localPackagesDir);
            const globalPackagesDir = globalDirs.npm.packages;
            const globalPluginData = yield this.findOnDir(globalPackagesDir);
            // Removes local packages from the global ones
            const globalNotInLocal = globalPluginData.filter(globalData => !localPluginData.find(localData => localData.name == globalData.name));
            return localPluginData.concat(globalNotInLocal);
        });
    }
    ;
    /** @inheritdoc */
    classFileFor(pluginData) {
        return __awaiter(this, void 0, void 0, function* () {
            return path_1.resolve(this._appPath, pluginData.file);
        });
    }
    findOnDir(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageDirectories = yield this.findPluginPackageDirectories(dir);
            const conversor = new PackageToPluginData_1.PackageToPluginData(this.PACKAGE_PROPERTY);
            const readFile = util_1.promisify(this._fs.readFile);
            let pluginData = [];
            for (const pkgDir of packageDirectories) {
                const pkgFile = path_1.join(pkgDir, this.PACKAGE_FILE);
                let content;
                try {
                    content = yield readFile(pkgFile);
                }
                catch (err) {
                    throw new Error(`Cannot read plugin data from "${pkgFile}" because the file cannot be read. Details: ` + err.message);
                }
                const pkg = JSON.parse(content);
                const data = conversor.convert(pkg);
                if (!data) {
                    // continue; // Cannot convert to plugin data
                    throw new Error(`Cannot convert package file "${pkgFile}" to plugin data. `);
                }
                pluginData.push(data);
            }
            return pluginData;
        });
    }
    findPluginPackageDirectories(dir) {
        return new Promise((resolve, reject) => {
            let directories = [];
            const dirRegExp = new RegExp(this.PLUGIN_PACKAGE_PREFIX);
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
