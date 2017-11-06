import { TestScriptPluginData } from "./TestScriptPluginData";
import { JsonBasedTestScriptPluginFinder } from "./JsonBasedTestScriptPluginFinder";
import * as chalk from 'chalk'; // colors & style
import { sprintf } from 'sprintf-js';
import * as path from 'path';
import * as childProcess from 'child_process';

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
                    this.showMessageOnNoPluginFound( name );
                    return;
                }
                this.drawSinglePlugin( found[ 0 ] );
            } )
            .catch( ( err ) => this._write( err.message ) );
    };

    install = ( name: string ): void => {

        this.find()
            .then( ( plugins: TestScriptPluginData[] ) => {
                let found = plugins.filter( p => p.name === name );
                if ( 0 === found.length ) {
                    this.showMessageOnNoPluginFound( name );
                    return;
                }
                const command = found[ 0 ].install;
                if ( ! command ) {
                    this._write( 'No "install" property found in the plugin file. Can\'t install it.' );
                    return;
                }
                this._write( 'Installing the plugin ' + chalk.yellow( name ) + '...' );
                this.runPluginCommand( command );
            } )
            .catch( ( err ) => this._write( err.message ) );
    };

    uninstall = ( name: string ): void => {
        
        this.find()
            .then( ( plugins: TestScriptPluginData[] ) => {
                let found = plugins.filter( p => p.name === name );
                if ( 0 === found.length ) {
                    this.showMessageOnNoPluginFound( name );
                    return;
                }
                const command = found[ 0 ].uninstall;
                if ( ! command ) {
                    this._write( 'No "uninstall" property found in the plugin file. Can\'t uninstall it.' );
                    return;
                }
                this._write( 'Uninstalling the plugin ' + chalk.yellow( name ) + '...' );
                this.runPluginCommand( command );
            } )
            .catch( ( err ) => this._write( err.message ) );        
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

    private showMessageOnNoPluginFound = ( name: string ): void => {
        this._write( 'No plugins found with the name "' + chalk.yellow( name ) + '".'
            + '\nTry ' + chalk.yellow( '--plugin-list' ) + ' to see the available plugins.' );
    };

    private find = (): Promise< TestScriptPluginData[] > => {
        const dir = path.join( process.cwd(), '/plugins' );
        const finder = new JsonBasedTestScriptPluginFinder( dir );
        return finder.find();
    };

    private runPluginCommand = ( command: string ): void => {
        this._write( '---' );        
        const child = childProcess.exec( command );
        
        child.stdout.on( 'data', ( chunk ) => {
            this._write( chunk.toString() );
        } );

        child.stderr.on( 'data', ( chunk ) => {
            this._write( chunk.toString() );
        } );

        child.on( 'exit', ( code ) => {
            this._write( '---' );
            this._write( ( 0 == code ? chalk.bgGreen( 'Success' ) : chalk.bgRed( 'Errors were found.' ) ) );
        } );                
    };

}