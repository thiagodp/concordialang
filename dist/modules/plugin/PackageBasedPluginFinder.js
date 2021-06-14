import * as globalDirs from 'global-dirs';
import { join, relative, resolve } from 'path';
import { toUnixPath } from '../util/file';
import { isPlugin, PACKAGE_FILE, PLUGIN_PREFIX, pluginDataFromPackage } from './PluginData';
/**
 * Finds plugins based on installed NodeJS packages.
 *
 * @author Thiago Delgado Pinto
 */
export class PackageBasedPluginFinder {
    constructor(_processPath, _fileReader, _dirSearcher) {
        this._processPath = _processPath;
        this._fileReader = _fileReader;
        this._dirSearcher = _dirSearcher;
        this.NODE_MODULES = 'node_modules';
    }
    /** @inheritdoc */
    async find() {
        const localPackagesDir = resolve(this._processPath, this.NODE_MODULES);
        // console.log( ' Finding at', localPackagesDir, '...' );
        const localPluginData = await this.findOnDir(localPackagesDir);
        const globalPackagesDir = globalDirs.npm.packages;
        // console.log( ' Finding at', globalPackagesDir, '...' );
        const globalPluginData = await this.findOnDir(globalPackagesDir);
        // console.log( 'Local', localPluginData.length, 'found. Global', globalPluginData.length, 'found.' );
        // Removes local packages from the global ones
        const globalNotInLocal = globalPluginData.filter(globalData => !localPluginData.find(localData => localData.name == globalData.name));
        return localPluginData.concat(globalNotInLocal);
    }
    // /** @inheritdoc */
    // public async classFileFor( pluginData: PluginData ): Promise< string > {
    //     // The property pluginData.file is changed when the file is loaded,
    //     // so it have the full path.
    //     return pluginData.main;
    // }
    /**
     * Finds Concordia plug-ins and returns their data.
     *
     * @param dir Directory to find.
     */
    async findOnDir(dir) {
        let packageDirectories = [];
        try {
            packageDirectories = await this.detectPluginPackageDirectories(dir);
        }
        catch (err) {
            return [];
        }
        // console.log( 'Detected directories to analyze:', packageDirectories );
        let allPluginData = [];
        for (const pkgDir of packageDirectories) {
            const pkgFile = join(pkgDir, PACKAGE_FILE);
            // console.log( 'Reading', pkgFile, '...' );
            let content;
            try {
                content = await this._fileReader.read(pkgFile);
                if (!content) {
                    continue; // Ignores a file that does not exist
                }
            }
            catch (err) {
                if ('ENOENT' === err.code) {
                    continue; // Ignores a file that does not exist
                }
                throw new Error(`Cannot read plugin data from "${pkgFile}" because the file cannot be read. Details: ` + err.message);
            }
            const pkg = JSON.parse(content);
            // Ignore concordialang- packages without the plugin-related property
            if (pkg && !isPlugin(pkg)) {
                continue; // ignore
            }
            const pluginData = pluginDataFromPackage(pkg);
            if (!pluginData) {
                // continue; // Cannot convert to plugin data
                throw new Error(`Cannot convert package file "${pkgFile}" to plugin data. `);
            }
            const old = pluginData;
            const isOldPlugin = !!old.file;
            if (isOldPlugin) {
                // Update the property 'file' to include the directory and maybe the package name
                if (old.file.indexOf(pluginData.name) < 0) {
                    old.file = join(dir, pluginData.name, old.file);
                }
                else {
                    old.file = join(dir, old.file);
                }
            }
            else {
                // pluginData.main = join( dir, pluginData.name, pluginData.main );
                pluginData.main = toUnixPath(relative('.', join(dir, pluginData.name, pluginData.main || '')));
                // // Update the property 'main' to include the directory and maybe the package name
                // if ( pluginData.main.indexOf( pluginData.name ) < 0 ) {
                //     pluginData.main = join( dir, pluginData.name, pluginData.main );
                // } else {
                //     pluginData.main = join( dir, pluginData.main );
                // }
            }
            allPluginData.push(pluginData);
        }
        return allPluginData;
    }
    /**
     * Detects Concordia plug-ins' directories, i.e., those starting with `concordialang-'.
     *
     * @param dir Directory to find.
     */
    async detectPluginPackageDirectories(dir) {
        const o = {
            directory: dir,
            recursive: false,
            regexp: new RegExp(PLUGIN_PREFIX)
        };
        return await this._dirSearcher.search(o);
    }
}
