import { resolve, join } from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import * as globalDirs from 'global-dirs';
import * as fwalker from 'fwalker';
import { PluginFinder } from "./PluginFinder";
import { PluginData } from "./PluginData";
import { PackageToPluginData } from './PackageToPluginData';

/**
 * Finds plugins based on installed NodeJS packages.
 *
 * @author Thiago Delgado Pinto
 */
export class PackageBasedPluginFinder implements PluginFinder {

    public readonly PLUGIN_PACKAGE_PREFIX: string = 'concordialang-';
    public readonly NODE_MODULES: string = 'node_modules';
    public readonly PACKAGE_FILE: string = 'package.json';
    public readonly PACKAGE_PROPERTY: string = 'concordiaPluginData';

    constructor(
        private readonly _appPath: string,
        private readonly _fs: any = fs
        ) {
    }


    /** @inheritdoc */
    public async find(): Promise< PluginData[] > {

        const localPackagesDir = resolve( this._appPath, this.NODE_MODULES );
        const localPluginData: PluginData[] = await this.findOnDir( localPackagesDir );

        const globalPackagesDir = globalDirs.npm.packages;
        const globalPluginData: PluginData[] = await this.findOnDir( globalPackagesDir );

        // Removes local packages from the global ones
        const globalNotInLocal: PluginData[] = globalPluginData.filter(
            globalData => ! localPluginData.find( localData => localData.name == globalData.name ) );

        return localPluginData.concat( globalNotInLocal );
    };

    /** @inheritdoc */
    public async classFileFor( pluginData: PluginData ): Promise< string > {
        // The property pluginData.file is changed when the file is loaded,
        // so it have the full path.
        return pluginData.file;
    }

    /**
     * Finds Concordia plug-ins and returns their data.
     *
     * @param dir Directory to find.
     */
    private async findOnDir( dir: string ): Promise< PluginData[] > {

        const packageDirectories: string[] = await this.detectPluginPackageDirectories( dir );
        const conversor = new PackageToPluginData( this.PACKAGE_PROPERTY );

        const readFile = promisify( this._fs.readFile );

        let pluginData: PluginData[] = [];
        for ( const pkgDir of packageDirectories ) {

            const pkgFile: string = join( pkgDir, this.PACKAGE_FILE );

            let content: string;
            try {
                content = await readFile( pkgFile );
            } catch ( err ) {
                throw new Error( `Cannot read plugin data from "${pkgFile}" because the file cannot be read. Details: ` + err.message );
            }
            const pkg: any = JSON.parse( content );
            const data = conversor.convert( pkg );
            if ( ! data ) {
                // continue; // Cannot convert to plugin data
                throw new Error( `Cannot convert package file "${pkgFile}" to plugin data. ` );
            }

            // Modifies the `file` property to contain the full path
            if ( data.file.indexOf( data.name ) < 0 ) {
                data.file = join( dir, data.name, data.file );
            } else {
                data.file = join( dir, data.file );
            }

            pluginData.push( data );
        }

        return pluginData;
    }


    /**
     * Detects Concordia plug-ins' directories, i.e.,  starting with `concordialang-'.
     *
     * @param dir Directory to find.
     */
    private detectPluginPackageDirectories( dir: string ): Promise< string[] > {

        return new Promise< string[] >( ( resolve, reject ) => {

            let directories: string[] = [];
            const dirRegExp = new RegExp( this.PLUGIN_PACKAGE_PREFIX );

            const onDir = ( path, stats, absPath ) => {
                // Ignore directories that do not match the prefix
                if ( ! dirRegExp.test( path ) ) {
                    return;
                }
                directories.push( absPath );
            };

            const options = {
                recursive: false,
                maxAttempts: 1,
                fs: this._fs
            };

            fwalker( dir, options )
                .on( 'dir', onDir )
                .on( 'error', ( err ) => reject( err ) )
                .on( 'done', () => resolve( directories ) )
                .walk();

        } );
    }

}