import * as childProcess from 'child_process';
import { Plugin } from "concordialang-plugin";
import * as inquirer from 'inquirer';
import { join } from 'path';
import { CLI } from '../cli/CLI';
import { FileReader } from '../util/file/FileReader';
import { PluginData, PLUGIN_PREFIX } from "./PluginData";
import { PluginDrawer } from "./PluginDrawer";
import { PluginFinder } from "./PluginFinder";

/**
 * Plug-in manager
 *
 * @author Thiago Delgado Pinto
 */
export class PluginManager {

    constructor(
        private readonly _cli: CLI,
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

    public async installByName( name: string, drawer: PluginDrawer ): Promise< void > {

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

            const PACKAGE_FILE = 'package.json';
            const PACKAGE_CREATION_CMD = 'npm init --yes';

            let mustGeneratePackageFile: boolean = false;

            try {
                const path = join( process.cwd(), PACKAGE_FILE );

                const content: string | null = await this._fileReader.read( path );

                if ( ! content ) { // No package.json
                    mustGeneratePackageFile = true;
                    drawer.showMessagePackageFileNotFound( PACKAGE_FILE );
                }
            } catch ( err ) {
                mustGeneratePackageFile = true;
            }

            // Create package.json if it does not exist

            if ( mustGeneratePackageFile ) {
                const code: number = await this.runCommand( PACKAGE_CREATION_CMD );
                drawer.showCommandCode( code, false );
            }
        }

        // Install the plug-in as a DEVELOPMENT dependency using NPM

        const PACKAGE_MANAGER = 'NPM';
        const INSTALL_DEV_CMD = 'npm install --save-dev ' + name + ' --color=always';

        drawer.showMessageTryingToInstall( name, PACKAGE_MANAGER );
        const code: number = await this.runCommand( INSTALL_DEV_CMD );
        drawer.showCommandCode( code, false );
        if ( code !== 0 ) { // unsuccessful
            return;
        }

        // Check if the plug-in is installed

        pluginData = await this.pluginWithName( name, false );
        if ( ! pluginData ) {
            drawer.showMessageCouldNoFindInstalledPlugin( name );
            return;
        }
    }


    public async uninstallByName( name: string, drawer: PluginDrawer ): Promise< void > {

        if ( ! name.includes( PLUGIN_PREFIX ) ) {
            name = PLUGIN_PREFIX + name;
        }

        let pluginData: PluginData = await this.pluginWithName( name, false );
        if ( ! pluginData ) {
            drawer.showMessagePluginNotFound( name );
            return;
        }

        // Remove with a package manager
        drawer.showMessageTryingToUninstall( name, 'NPM' );
        let code: number = await this.runCommand( 'npm uninstall --save-dev ' + name + ' --color=always' );
        drawer.showCommandCode( code );
    }

    public async serve( pluginData: PluginData, drawer: PluginDrawer ): Promise< void > {

        if ( ! pluginData.serve ) {
            throw new Error( 'No "serve" property found in the plugin file. Can\'t serve.' );
        }

        drawer.showPluginServeStart( pluginData.name );
        const code = await this.runCommand( pluginData.serve );
        drawer.showCommandCode( code );
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


    private async runCommand( command: string ): Promise< number > {

        const separationLine = '  ' + '_'.repeat( 78 );

        this._cli.newLine( '  Running', this._cli.colorHighlight( command ) );
        this._cli.newLine( separationLine );

        let options = {
            // detached: true, // main process can terminate
            // stdio: 'ignore', // ignore stdio since detach is active
            shell: true, // allow parameters in the command
            // stdio: 'inherit', // <<< not working on windows
        };

        // Splits the command into pieces to pass to the process;
        //  mapping function simply removes quotes from each piece
        let cmds = command.match( /[^"\s]+|"(?:\\"|[^"])+"/g )
            .map( expr => {
                return expr.charAt( 0 ) === '"' && expr.charAt( expr.length - 1 ) === '"' ? expr.slice( 1, -1 ) : expr;
            } );
        const runCMD = cmds[ 0 ];
        cmds.shift();

        return new Promise< any >( ( resolve, reject ) => {

            // Executing

            const child = childProcess.spawn( runCMD, cmds, options );

            child.stdout.on( 'data', ( chunk ) => {
                console.log( chunk.toString() );
            } );

            child.stderr.on( 'data', ( chunk ) => {
                console.warn( chunk.toString() );
            } );

            child.on( 'exit', ( code ) => {
                console.log( separationLine );
                resolve( code );
            } );

        } );
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