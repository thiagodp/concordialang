import { TestScriptPluginData } from "../testscript/TestScriptPluginData";
import { JsonBasedTestScriptPluginFinder } from "../testscript/JsonBasedTestScriptPluginFinder";
import { PluginDrawer } from "./PluginDrawer";
import { TestScriptPlugin } from "../testscript/TestScriptPlugin";
import * as path from 'path';
import * as childProcess from 'child_process';

/**
 * Plug-in manager
 * 
 * @author Thiago Delgado Pinto
 */
export class PluginManager {

    public findAll = async (): Promise< TestScriptPluginData[] > => {
        const dir = path.join( process.cwd(), '/plugins' );
        const finder = new JsonBasedTestScriptPluginFinder( dir );
        const all = await finder.find();
        return this.sortByName( all );
    };
    
    public pluginWithName = async ( name: string ): Promise< TestScriptPluginData | undefined > => {
        const all: TestScriptPluginData[] = await this.findAll();
        return all.find( ( v ) => v.name.toLowerCase() === name.toLowerCase() );
    };

    public install = async ( pluginData: TestScriptPluginData, drawer: PluginDrawer ): Promise< void > => {

        if ( ! pluginData.install ) {
            throw new Error( 'No "install" property found in the plugin file. Can\'t install it.' );
        }

        drawer.showPluginInstallStart( pluginData.name );
        this.runCommand( pluginData.install, drawer );
    };

    public uninstall = async ( pluginData: TestScriptPluginData, drawer: PluginDrawer ): Promise< void > => {

        if ( ! pluginData.uninstall ) {
            throw new Error( 'No "uninstall" property found in the plugin file. Can\'t uninstall it.' );
        }

        drawer.showPluginUninstallStart( pluginData.name );
        this.runCommand( pluginData.uninstall, drawer );
    };


    /**
     * Tries to load a plug-in and to return its instance.
     * 
     * @param basePluginDirectory Base plug-in directory.
     * @param pluginData Plug-in data
     */
    public load = async (
        basePluginDirectory: string,
        pluginData: TestScriptPluginData
    ): Promise< TestScriptPlugin > => {

        const pluginClassFile = path.join( basePluginDirectory, pluginData.file );

        // Dynamically include the file
        const pluginClassFileContext = require( pluginClassFile );

        // Create an instance of the class
        const obj = this.createInstance( pluginClassFileContext, pluginData.class, [] );

        return obj as TestScriptPlugin;        
    };


    private runCommand = ( command: string, drawer: PluginDrawer ): void => {

        const child = childProcess.exec( command );
        
        child.stdout.on( 'data', ( chunk ) => {
            drawer.showPluginExecutionOutput( chunk.toString() );
        } );

        child.stderr.on( 'data', ( chunk ) => {
            drawer.showPluginExecutionError( chunk.toString() );
        } );

        child.on( 'exit', ( code ) => {
            drawer.showPluginExecutionFinished( code );
        } );        
    };


    private sortByName = ( plugins: TestScriptPluginData[] ): TestScriptPluginData[] => {
        return plugins.sort( ( a: TestScriptPluginData, b: TestScriptPluginData ): number => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        } );
    };

    /**
     * Returns an instance of a given class name.
     * 
     * @param context Object used as context.
     * @param className Class to be instantied.
     * @param args Constructor arguments.
     * @return An instance of the given class.
     */
    private createInstance = ( context: any, className: string, ...args: any[] ): any => {
        return new context[ className ]( ... args );
    };
        
}