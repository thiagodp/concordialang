import * as globalDirs from 'global-dirs';
import { join, relative, resolve } from 'path';

import { toUnixPath } from '../util/file';
import { DirSearcher } from '../util/file/DirSearcher';
import { FileReader } from '../util/file/FileReader';
import { isPlugin, OldPluginData, PACKAGE_FILE, PLUGIN_PREFIX, pluginDataFromPackage } from './PluginData';
import { NewOrOldPluginData, PluginFinder } from './PluginFinder';

/**
 * Finds plugins based on installed NodeJS packages.
 *
 * @author Thiago Delgado Pinto
 */
export class PackageBasedPluginFinder implements PluginFinder {

    public readonly NODE_MODULES: string = 'node_modules';

    constructor(
        private readonly _processPath: string,
        private readonly _fileReader: FileReader,
        private readonly _dirSearcher: DirSearcher
        ) {
    }


    /** @inheritdoc */
    public async find(): Promise< NewOrOldPluginData[] > {

        const localPackagesDir = resolve( this._processPath, this.NODE_MODULES );
        // console.log( ' Finding at', localPackagesDir, '...' );
        const localPluginData = await this.findOnDir( localPackagesDir );

        const globalPackagesDir = globalDirs.npm.packages;
        // console.log( ' Finding at', globalPackagesDir, '...' );
        const globalPluginData = await this.findOnDir( globalPackagesDir );

        // console.log( 'Local', localPluginData.length, 'found. Global', globalPluginData.length, 'found.' );

        // Removes local packages from the global ones
        const globalNotInLocal = globalPluginData.filter(
            globalData => ! localPluginData.find( localData => localData.name == globalData.name ) );

        return localPluginData.concat( globalNotInLocal );
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
    private async findOnDir( dir: string ): Promise< NewOrOldPluginData[] > {

        let packageDirectories: string[] = [];
        try {
            packageDirectories = await this.detectPluginPackageDirectories( dir );
        } catch ( err ) {
            return [];
        }
        // console.log( 'Detected directories to analyze:', packageDirectories );

        let allPluginData: NewOrOldPluginData[] = [];
        for ( const pkgDir of packageDirectories ) {

            const pkgFile: string = join( pkgDir, PACKAGE_FILE );
            // console.log( 'Reading', pkgFile, '...' );

            let content: string;
            try {
                content = await this._fileReader.read( pkgFile );
                if ( ! content ) {
                    continue; // Ignores a file that does not exist
                }
            } catch ( err ) {
                if ( 'ENOENT' === err.code ) {
                    continue; // Ignores a file that does not exist
                }
                throw new Error( `Cannot read plugin data from "${pkgFile}" because the file cannot be read. Details: ` + err.message );
            }
            const pkg: any = JSON.parse( content );

            // Ignore concordialang- packages without the plugin-related property
            if ( pkg && ! isPlugin( pkg ) ) {
                continue; // ignore
            }

            const pluginData = pluginDataFromPackage( pkg );
            if ( ! pluginData ) {
                // continue; // Cannot convert to plugin data
                throw new Error( `Cannot convert package file "${pkgFile}" to plugin data. ` );
            }

            const old = pluginData as OldPluginData;
            const isOldPlugin = !! old.file;
            if ( isOldPlugin ) {
                // Update the property 'file' to include the directory and maybe the package name
                if ( old.file.indexOf( pluginData.name ) < 0 ) {
                    old.file = join( dir, pluginData.name, old.file );
                } else {
                    old.file = join( dir, old.file );
                }
            } else {

                // pluginData.main = join( dir, pluginData.name, pluginData.main );
                pluginData.main = toUnixPath( relative( '.', join( dir, pluginData.name, pluginData.main || '' ) ) );


                // // Update the property 'main' to include the directory and maybe the package name
                // if ( pluginData.main.indexOf( pluginData.name ) < 0 ) {
                //     pluginData.main = join( dir, pluginData.name, pluginData.main );
                // } else {
                //     pluginData.main = join( dir, pluginData.main );
                // }
            }

            allPluginData.push( pluginData );
        }

        return allPluginData;
    }


    /**
     * Detects Concordia plug-ins' directories, i.e., those starting with `concordialang-'.
     *
     * @param dir Directory to find.
     */
    private async detectPluginPackageDirectories( dir: string ): Promise< string[] > {
        const o = {
            directory: dir,
            recursive: false,
            regexp: new RegExp( PLUGIN_PREFIX )
        };
        return await this._dirSearcher.search( o );
    }

}