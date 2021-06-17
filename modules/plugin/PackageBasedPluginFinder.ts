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
        private readonly _dirSearcher: DirSearcher,
		private readonly _listener?: {
			warn: ( message: string ) => void,
		}
        ) {
    }


    /** @inheritdoc */
    public async find(): Promise< NewOrOldPluginData[] > {

        const localPackagesDir = resolve( this._processPath, this.NODE_MODULES );
        const globalPackagesDir = globalDirs.npm.packages;

		const [ localPluginData, globalPluginData ] = await Promise.all( [
			this.findOnDir( localPackagesDir ),
			this.findOnDir( globalPackagesDir )
		 ] )

        // Removes local packages from the global ones
        const globalNotInLocal = globalPluginData.filter(
            globalData => ! localPluginData.find( localData => localData.name == globalData.name )
		);

        return localPluginData.concat( globalNotInLocal );
    }

    /**
     * Finds Concordia plug-ins and returns their data.
     *
     * @param dir Directory to find.
     */
    public async findOnDir( dir: string ): Promise< NewOrOldPluginData[] > {

        let packageDirectories: string[] = [];
        try {
            packageDirectories = await this.detectPluginPackageDirectoriesOnDir( dir );
        } catch ( err ) {
            return [];
        }

        let allPluginData: NewOrOldPluginData[] = [];
        for ( const pkgDir of packageDirectories ) {

            const pkgFile: string = join( pkgDir, PACKAGE_FILE );

			// Read file
            let content: string;
            try {
                content = await this._fileReader.read( pkgFile );
            } catch ( err ) {
				if ( this._listener ) {
					const msg = `Cannot read plugin data from "${pkgFile}" because the file cannot be read. Details: ${err.message}`;
					this._listener.warn( msg );
				}
                continue; // Ignores a file that does not exist or cannot be read
            }

			// Ignore an empty content
			if ( ! content ) {
				continue; // Ignores a file that does not exist
			}

			// Parse JSON
            let pkg: any;
			try {
				pkg = JSON.parse( content );
			} catch ( err ) {
				if ( this._listener ) {
					this._listener.warn( `Plugin ${pkgDir} cannot be parsed.` );
				}
				continue; // cannot parse -> ignore the file
			}

            // Ignore "concordialang-" packages without the plugin-related property
            if ( pkg && ! isPlugin( pkg ) ) {
                continue; // ignore
            }

            const pluginData = pluginDataFromPackage( pkg );
			// Invalid format
            if ( ! pluginData ) {
				if ( this._listener ) {
					this._listener.warn( `Plugin ${pkgDir} does not have the data required by Concordia Compiler.` );
				}
				continue;
            }

            // Update the property that contains the plug-in file to include the directory
            const old = pluginData as OldPluginData;
            const isOldPlugin = !! old.file;
            if ( isOldPlugin ) {
                if ( old.file.indexOf( pluginData.name ) < 0 ) {
                    old.file = join( dir, pluginData.name, old.file );
                } else {
                    old.file = join( dir, old.file );
                }
            } else {
                pluginData.main = toUnixPath( relative( '.', join( dir, pluginData.name, pluginData.main || '' ) ) );
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
    private async detectPluginPackageDirectoriesOnDir( dir: string ): Promise< string[] > {
        const o = {
            directory: dir,
            recursive: false,
            regexp: new RegExp( PLUGIN_PREFIX )
        };
        return this._dirSearcher.search( o );
    }

}
