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
                this.drawPlugins( plugins );
            } )
            .catch( ( err ) => this._write( err.message ) );
    };

    about = ( name: string ): void => {
        
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

    private drawPlugins = ( plugins: TestScriptPluginData[] ) => {
        const format = "%-20s %-8s %-22s"; // util.format does not support padding :(
        this._write( chalk.yellow( sprintf( format, 'Name', 'Version', 'Description' ) ) );
        plugins = this.sortPlugins( plugins );
        for ( let p of plugins ) {
            this._write( sprintf( format, p.name, p.version, p.description ) );
        }
    };

    private find = (): Promise< TestScriptPluginData[] > => {
        const dir = path.join( process.cwd(), '/plugins' );
        const finder = new JsonBasedTestScriptPluginFinder( dir );
        return finder.find();
    };

}