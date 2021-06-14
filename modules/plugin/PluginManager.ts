import { Plugin } from 'concordialang-plugin';
import * as inquirer from 'inquirer';
import { join } from 'path';
import { loadPlugin } from 'load-plugin';

import { FileReader } from '../util/file/FileReader';
import {
    makePackageInitCommand,
    makePackageInstallCommand,
    makePackageUninstallCommand,
    PackageManager,
} from '../util/package-installation';
import { runCommand } from '../util/run-command';
import { OldPluginData, PACKAGE_FILE, PLUGIN_PREFIX, PluginData } from './PluginData';
import { NewOrOldPluginData, PluginFinder } from './PluginFinder';
import { PluginListener } from './PluginListener';
import { toUnixPath } from '../util/file';



const { pathToFileURL } = require('url');
const NATIVE_REQUIRE = eval('require');
const NATIVE_IMPORT = (filepath) => import(filepath);
const r = require('resolve');



/**
 * A utility function to use Node's native `require` or dynamic `import` to load CJS or ESM files
 * @param {string} filepath
 */
 /*module.exports = */async function requireOrImport(filepath, { from = process.cwd() } = {}) {
    return new Promise((resolve, reject) => {
        // Resolve path based on `from`
        const resolvedPath = r.sync(filepath, {
            basedir: from
        });
        try {
          const mdl = NATIVE_REQUIRE(resolvedPath);
          resolve(mdl);
        } catch (e) {
          const url = pathToFileURL(resolvedPath);
          console.log( 'url', url );
        // const url = resolvedPath;
          if (e instanceof SyntaxError && /export|import/.test(e.message)) {
            console.error(`Failed to load "${filepath}"!\nESM format is not natively supported in "node@${process.version}".\nPlease use CommonJS or upgrade to an LTS version of node above "node@12.17.0".`)
          }
          return NATIVE_IMPORT(url.pathname.substring( 1 ) )
            .then(mdl => resolve(mdl.default ? mdl.default : mdl))
            .catch( reject );
        }
    })
}



/**
 * Plug-in manager
 *
 * @author Thiago Delgado Pinto
 */
export class PluginManager {

    constructor(
        private readonly _packageManager: string,
        private readonly _pluginListener: PluginListener,
        private readonly _finder: PluginFinder,
        private readonly _fileReader: FileReader
        ) {
    }

    /**
     * Tries to load a plug-in and to return its instance.
     *
     * @param pluginData Plug-in data
     */
     public async load( pluginData: PluginData ): Promise< Plugin > {

        console.log( 'WILL LOAD' );

        const old = pluginData as OldPluginData;
        const isOldPlugin = !! old.file;

        if ( isOldPlugin ) {
            // Dynamically require the file
            const pluginClassFileContext = require( old.file ); // NOTE: "file" is updated when the package is loaded
            // const pluginClassFileContext = await import( old.file ); // NOTE: "file" is updated when the package is loaded
            // Create an instance of the class
            const obj = this.createInstance( pluginClassFileContext, old.class, [] );
            return obj as Plugin;
        }

        console.log( 'WILL REQUIRE -> ', pluginData.name, 'at', pluginData.main );
        // const P = ( await import( "./" + pluginData.main ) ).default;
        // const P = require( pluginData.main );

        // const plugin = await loadPlugin( pluginData.name );
        // const plugin = require( pluginData.name );

        const file =  'concordialang-playwright';
        // const file =  join( process.cwd(), pluginData.main );
        // const file =  toUnixPath( './' + pluginData.main );
        console.log( 'file', file );
        console.log( 'cwd', process.cwd() );
        // const plugin = require( file );
        try {
            const plugin = await requireOrImport( file );
            console.log( 'plugin', plugin );
            return plugin as Plugin;
        } catch( err ) {
            console.log( err );
            return;
        }
    }


    public async findAll(): Promise< NewOrOldPluginData[] > {
        const all = await this._finder.find();
        return this.sortByName( all );
    }

    public async pluginWithName( name: string, partialComparison: boolean = false ): Promise< NewOrOldPluginData | undefined > {

        const usualComparison = ( from: string, to: string ) => {
            return ( from === to )
                || ( from === PLUGIN_PREFIX + to )
                || ( PLUGIN_PREFIX + from === to );
        };

        const removeVersionFromName = ( name: string ) => {
            const index = name.lastIndexOf( '@' );
            if ( index < 0 ) {
                return name;
            }
            return name.substring( 0, index );
        };

        const compareNames = ( from: string, to: string, partialComparison: boolean ): boolean => {

            if ( partialComparison ) {
                return from.includes( to );
            }

            if ( usualComparison( from, to ) ) {
                return true;
            }

            return usualComparison( removeVersionFromName( from ), removeVersionFromName( to ) );
        };

        const all = await this.findAll();
        const lowerCasedName: string = name.toLowerCase();
        const withName = all.filter(
            v => compareNames( v.name.toLowerCase(), lowerCasedName, partialComparison ) );

        return withName.length > 0 ? withName[ 0 ] : undefined;
    }

    public async installByName( name: string ): Promise< void > {

        if ( ! name.includes( PLUGIN_PREFIX ) ) {
            name = PLUGIN_PREFIX + name;
        }

        let pluginData = await this.pluginWithName( name, false );

        if ( pluginData ) { // already exists

            let answer = await inquirer.prompt( [
                {
                    type: 'confirm',
                    name: 'install',
                    message: 'Plug-in already installed. Do you want to try to install it again?'
                }
            ] );

            if ( ! answer.install ) {
                return;
            }

        } else { // plug-in does not exist

            // Check if package.json exists

            let mustGeneratePackageFile: boolean = false;
            try {
                const path = join( process.cwd(), PACKAGE_FILE );

                const content: string | null = await this._fileReader.read( path );

                if ( ! content ) { // No package.json
                    mustGeneratePackageFile = true;
                    this._pluginListener.showMessagePackageFileNotFound( PACKAGE_FILE );
                }
            } catch ( err ) {
                mustGeneratePackageFile = true;
            }

            // Create package.json if it does not exist

            if ( mustGeneratePackageFile ) {
                const cmd = makePackageInitCommand( this._packageManager as PackageManager );  // 'npm init --yes';
                await this.runCommand( cmd );
            }
        }

        // Install the package as a DEVELOPMENT dependency
        const command = makePackageInstallCommand( name, this._packageManager as PackageManager )
        const code: number = await this.runCommand( command );
        if ( code !== 0 ) { // unsuccessful
            return;
        }

        // Check if it is installed
        pluginData = await this.pluginWithName( name, false );
        if ( ! pluginData ) {
            this._pluginListener.showMessageCouldNoFindInstalledPlugin( name );
        }
    }


    public async uninstallByName( name: string ): Promise< number > {

        if ( ! name.includes( PLUGIN_PREFIX ) ) {
            name = PLUGIN_PREFIX + name;
        }

        let pluginData = await this.pluginWithName( name, false );
        if ( ! pluginData ) {
            this._pluginListener.showMessagePluginNotFound( name );
            return;
        }

        // Uninstall the package
        const command = makePackageUninstallCommand( name, this._packageManager as PackageManager );
        return this.runCommand( command );
    }

    public async serve( pluginData: NewOrOldPluginData ): Promise< number > {

        /*
        if ( ! pluginData.serve ) {
            throw new Error( 'No "serve" property found in the plugin file. Can\'t serve.' );
        }

        this._pluginListener.showPluginServeStart( pluginData.name );
        await this.runCommand( pluginData.serve );
        */

        let serveCommand: string;

        const old = pluginData as OldPluginData;
        const isOldPlugin = !! old.file;

        if ( isOldPlugin  ) {
            serveCommand = old.serve;
        } else {
            const plugin = await this.load( pluginData );
            if ( ! plugin ) {
                throw new Error( 'Could not load the plug-in ' + ( pluginData?.name || '' ) );
            }
            serveCommand = plugin.serveCommand;
        }

        // Warn the user that no server command is available
        if ( ! serveCommand ) {
            this._pluginListener.showPluginServeUndefined( pluginData.name );
            return;
        }

        this._pluginListener.showPluginServeStart( pluginData.name );
        return this.runCommand( serveCommand );
    }

    // -------------------------------------------------------------------------

    private async runCommand( command: string ): Promise< number > {
        this._pluginListener.showCommandStarted( command );
        const code = await runCommand( command );
        this._pluginListener.showCommandFinished( code );
        return code;
    }

    private sortByName( plugins: PluginData[] ): PluginData[] {
        return plugins.sort( ( a: PluginData, b: PluginData ): number => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        } );
    }

    /**
     * Returns an instance of a given class name.
     *
     * @param context Object used as context.
     * @param className Class to be instantiated.
     * @param args Constructor arguments.
     * @return An instance of the given class.
     */
    private createInstance( context: any, className: string, args: any[] ): any {
        return new context[ className ]( ... args );
    }

}

