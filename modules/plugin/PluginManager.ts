import * as childProcess from 'child_process';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import { join } from 'path';
import { Plugin } from "concordialang-plugin";
import { PluginData, PLUGIN_PREFIX } from "./PluginData";
import { JsonBasedPluginFinder } from "./JsonBasedPluginFinder";
import { PluginDrawer } from "./PluginDrawer";
import { PluginFinder } from "./PluginFinder";
import { readFileAsync } from '../util/read-file';

/**
 * Plug-in manager
 *
 * @author Thiago Delgado Pinto
 */
export class PluginManager {

    private readonly _finder: PluginFinder;

    constructor(
        private _pluginDir: string,
        finder?: PluginFinder,
        private _fs: any = fs
        ) {
        this._finder = finder || new JsonBasedPluginFinder( this._pluginDir );
    }

    public async findAll(): Promise< PluginData[] > {
        const all = await this._finder.find();
        return this.sortByName( all );
    }

    public async pluginWithName( name: string, partialComparison: boolean = false ): Promise< PluginData | null > {

        const compareNames = ( from: string, to: string, partialComparison: boolean ): boolean => {
            return partialComparison
                ? from.includes( to )
                : ( from === to || from === PLUGIN_PREFIX + to || PLUGIN_PREFIX + from === to );
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
        let r;

        if ( pluginData ) {

            r = await inquirer.prompt( [
                {
                    type: 'confirm',
                    name: 'install',
                    message: 'Plug-in already installed. Do you want to try to install it again?'
                }
            ] );

            if ( ! r.install ) {
                return;
            }

        } else {

            const PACKAGE_FILE = 'package.json';
            const PACKAGE_CREATION_CMD = 'npm init --yes';

            let mustGeneratePackageFile: boolean = false;

            try {
                const path = join( process.cwd(), PACKAGE_FILE );

                const content: string | null = await readFileAsync(
                    path,
                    { fs: this._fs, silentIfNotExists: true }
                );

                if ( ! content ) { // No package.json
                    mustGeneratePackageFile = true;
                    drawer.showMessagePackageFileNotFound( PACKAGE_FILE );
                }
            } catch ( err ) {
                mustGeneratePackageFile = true;
            }

            if ( mustGeneratePackageFile ) {
                const code: number = await this.runPluginCommand( PACKAGE_CREATION_CMD, drawer );
                drawer.showCommandCode( code, false );
            }
        }

        const PACKAGE_MANAGER = 'NPM';
        const INSTALL_DEV_CMD = 'npm install --save-dev ' + name + ' --color=always';

        drawer.showMessageTryingToInstall( name, PACKAGE_MANAGER );
        const code: number = await this.runPluginCommand( INSTALL_DEV_CMD, drawer );
        drawer.showCommandCode( code, false );
        if ( code !== 0 ) { // unsuccessful
            return;
        }
        pluginData = await this.pluginWithName( name, false );
        if ( ! pluginData ) {
            drawer.showMessageCouldNoFindInstalledPlugin( name );
            return;
        }
        await this.install( pluginData, drawer );
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

        // Call "uninstall" command
        let code: number = await this.uninstall( pluginData, drawer, false );
        if ( code !== 0 ) {
            return;
        }

        // Remove with a package manager
        drawer.showMessageTryingToUninstall( name, 'NPM' );
        code = await this.runPluginCommand( 'npm uninstall --save-dev ' + name + ' --color=always', drawer );
        drawer.showCommandCode( code );
    }


    public async install( pluginData: PluginData, drawer: PluginDrawer ): Promise< number > {

        if ( ! pluginData.install ) {
            throw new Error( 'No "install" property found in the plugin file. Can\'t install it.' );
        }

        drawer.showPluginInstallStart( pluginData.name );
        const code: number = await this.runPluginCommand( pluginData.install, drawer );
        drawer.showCommandCode( code );
        return code;
    }

    public async uninstall(
        pluginData: PluginData,
        drawer: PluginDrawer,
        showCodeIfSuccess: boolean = true
    ): Promise< number > {

        if ( ! pluginData.uninstall ) {
            throw new Error( 'No "uninstall" property found in the plugin file. Can\'t uninstall it.' );
        }

        drawer.showPluginUninstallStart( pluginData.name );
        const code = await this.runPluginCommand( pluginData.uninstall, drawer );
        drawer.showCommandCode( code, showCodeIfSuccess );
        return code;
    }

    public async serve( pluginData: PluginData, drawer: PluginDrawer ): Promise< void > {

        if ( ! pluginData.serve ) {
            throw new Error( 'No "serve" property found in the plugin file. Can\'t serve.' );
        }

        drawer.showPluginServeStart( pluginData.name );
        const code = await this.runPluginCommand( pluginData.serve, drawer );
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


    private async runPluginCommand( command: string, drawer: PluginDrawer ): Promise< number > {

        const separationLine = '  ' + '_'.repeat( 78 );

        drawer.showCommand( command );
        drawer.write( separationLine );

        let options = {
            // detached: true, // main process can terminate
            // stdio: 'ignore', // ignore stdio since detache is active
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
     * @param className Class to be instantied.
     * @param args Constructor arguments.
     * @return An instance of the given class.
     */
    private createInstance( context: any, className: string, args: any[] ): any {
        return new context[ className ]( ... args );
    }

}