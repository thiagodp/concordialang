import { Plugin } from 'concordialang-plugin';
import * as inquirer from 'inquirer';
import { join } from 'path';

import { FileReader } from '../util/file/FileReader';
import {
    makePackageInitCommand,
    makePackageInstallCommand,
    makePackageUninstallCommand,
    PackageManager,
} from '../util/package-installation';
import { runCommand } from '../util/run-command';
import { PLUGIN_PREFIX, PluginData } from './PluginData';
import { PluginFinder } from './PluginFinder';
import { PluginListener } from './PluginListener';

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

    public async findAll(): Promise< PluginData[] > {
        const all = await this._finder.find();
        return this.sortByName( all );
    }

    public async pluginWithName( name: string, partialComparison: boolean = false ): Promise< PluginData | null > {

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

        const all: PluginData[] = await this.findAll();
        const lowerCasedName: string = name.toLowerCase();
        const withName: PluginData[] = all.filter(
            v => compareNames( v.name.toLowerCase(), lowerCasedName, partialComparison ) );

        return withName.length > 0 ? withName[ 0 ] : null;
    }

    public async installByName( name: string ): Promise< void > {

        if ( ! name.includes( PLUGIN_PREFIX ) ) {
            name = PLUGIN_PREFIX + name;
        }

        let pluginData: PluginData = await this.pluginWithName( name, false );

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
                const PACKAGE_FILE = 'package.json';
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
                const PACKAGE_CREATION_CMD = makePackageInitCommand( this._packageManager as PackageManager );  // 'npm init --yes';
                await this.runCommand( PACKAGE_CREATION_CMD );
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


    public async uninstallByName( name: string ): Promise< void > {

        if ( ! name.includes( PLUGIN_PREFIX ) ) {
            name = PLUGIN_PREFIX + name;
        }

        let pluginData: PluginData = await this.pluginWithName( name, false );
        if ( ! pluginData ) {
            this._pluginListener.showMessagePluginNotFound( name );
            return;
        }

        // Uninstall the package
        const command = makePackageUninstallCommand( name, this._packageManager as PackageManager );
        await this.runCommand( command );
    }

    public async serve( pluginData: PluginData ): Promise< void > {

        if ( ! pluginData.serve ) {
            throw new Error( 'No "serve" property found in the plugin file. Can\'t serve.' );
        }

        this._pluginListener.showPluginServeStart( pluginData.name );
        await this.runCommand( pluginData.serve );
    }

    /**
     * Tries to load a plug-in and to return its instance.
     *
     * @param pluginData Plug-in data
     */
    public async load( pluginData: PluginData ): Promise< Plugin > {

        const pluginClassFile: string = await this._finder.classFileFor( pluginData );

        // Dynamically include the file
        const pluginClassFileContext = require( pluginClassFile );

        // Create an instance of the class
        const obj = this.createInstance( pluginClassFileContext, pluginData.class, [] );

        return obj as Plugin;
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