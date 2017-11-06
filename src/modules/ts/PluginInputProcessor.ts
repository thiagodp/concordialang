import { TestScriptPluginData } from "./TestScriptPluginData";
import { JsonBasedTestScriptPluginFinder } from "./JsonBasedTestScriptPluginFinder";
import * as chalk from 'chalk'; // colors & style
import { sprintf } from 'sprintf-js';
import * as path from 'path';
   
/**
 * Plugin input processor.
 * 
 * @author Thiago Delgado Pinto
 */
export class PluginInputProcessor {

    constructor( private _write: any ) {
    }

    list = (): void => {
        this.find()
            .then( ( plugins: TestScriptPluginData[] ) => {
                this.drawPluginList( plugins );
            } )
            .catch( ( err ) => this._write( err.message ) );
    };

    about = ( name: string ): void => {
        this.find()
            .then( ( plugins: TestScriptPluginData[] ) => {
                let found = plugins.filter( p => p.name === name );
                if ( 0 === found.length ) {
                    this._write( 'No plugins found for "' + name + '". Try --plugin-list to see available plugins.' );
                    return;
                }
                this.drawSinglePlugin( found[ 0 ] );
            } )
            .catch( ( err ) => this._write( err.message ) );        
    };

    install = ( name: string ): void => {
        
    };

    uninstall = ( name: string ): void => {
        
    };

    private sortPlugins = ( plugins: TestScriptPluginData[] ): TestScriptPluginData[] => {
        return plugins.sort( ( a: TestScriptPluginData, b: TestScriptPluginData ): number => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        } );
    };

    private drawPluginList = ( plugins: TestScriptPluginData[] ): void => {
        const format = "%-20s %-8s %-22s"; // util.format does not support padding :(
        this._write( chalk.yellow( sprintf( format, 'Name', 'Version', 'Description' ) ) );
        plugins = this.sortPlugins( plugins );
        for ( let p of plugins ) {
            this._write( sprintf( format, p.name, p.version, p.description ) );
        }
    };

    private drawSinglePlugin = ( p: TestScriptPluginData ): void => {
        const format = "  - %-12s: %s"; // util.format does not support padding :(
        this._write( 'Plugin ' + chalk.yellow( p.name ) );
        this._write( sprintf( format, 'version', p.version ) );
        this._write( sprintf( format, 'description', p.description ) );
        this._write( sprintf( format, 'targets', p.targets.join( ', ' ) ) );
        const authors = p.authors.map( ( a, idx ) => 0 === idx ? a : sprintf( '%-17s %s', '', a ) );
        this._write( sprintf( format, 'authors', authors.join( '\n') ) );        
        this._write( sprintf( format, 'fake', p.isFake ? 'yes': 'no' ) );        
        this._write( sprintf( format, 'file', p.file ) );
        this._write( sprintf( format, 'class', p.class ) );        
    };

    private find = (): Promise< TestScriptPluginData[] > => {
        const dir = path.join( process.cwd(), '/plugins' );
        const finder = new JsonBasedTestScriptPluginFinder( dir );
        return finder.find();
    };

}