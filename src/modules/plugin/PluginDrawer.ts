import { CLI } from "../app/CLI";
import { PluginData } from "./PluginData";
import { sprintf } from 'sprintf-js';


export class PluginDrawer {

    constructor( private _cli: CLI ) {        
    }

    public drawPluginList = ( plugins: PluginData[] ): void => {
        const highlight = this._cli.colorHighlight;
        const format = "%-20s %-8s %-22s"; // util.format does not support padding :(
        this.write( highlight( sprintf( format, 'Name', 'Version', 'Description' ) ) );
        for ( let p of plugins ) {
            this.write( sprintf( format, p.name, p.version, p.description ) );
        }
    };

    public drawSinglePlugin = ( p: PluginData ): void => {
        const highlight = this._cli.colorHighlight;
        const format = "  - %-12s: %s"; // util.format does not support padding :(
        const authors = p.authors.map( ( a, idx ) => 0 === idx ? a : sprintf( '%-17s %s', '', a ) );
        this.write( 'Plugin ' + highlight( p.name ) );
        this.write( sprintf( format, 'version', p.version ) );
        this.write( sprintf( format, 'description', p.description ) );
        this.write( sprintf( format, 'targets', p.targets.join( ', ' ) ) );
        this.write( sprintf( format, 'authors', authors.join( '\n') ) );
        this.write( sprintf( format, 'fake', p.isFake ? 'yes': 'no' ) );
        this.write( sprintf( format, 'file', p.file ) );
        this.write( sprintf( format, 'class', p.class ) );
    };

    public showMessageOnNoPluginFound = ( name: string ): void => {
        const highlight = this._cli.colorHighlight;
        this.write( 'No plugins found with the name "' + highlight( name ) + '".'
            + '\nTry ' + highlight( '--plugin-list' ) + ' to see the available plugins.' );
    };

    public showPluginInstallStart = ( name: string ): void => {
        const highlight = this._cli.colorHighlight;
        this.write( 'Installing the plugin ' + highlight( name ) + '...' );
        this.write( '---' );
    };

    public showPluginUninstallStart = ( name: string ): void => {
        const highlight = this._cli.colorHighlight;
        this.write( 'Uninstalling the plugin ' + highlight( name ) + '...' );
        this.write( '---' );
    };    
    
    public showPluginExecutionOutput = ( ... args ): void => {
        this.write( ... args );
    };

    public showPluginExecutionError = ( ... args ): void => {
        this.write( ... args );
    };

    public showPluginExecutionFinished = ( code ): void => {
        const successColor = this._cli.colorSuccess;
        const errorColor = this._cli.colorError;
        this.write( '---' );
        this.write( ( 0 == code ? successColor( 'Success' ) : errorColor( 'Errors were found.' ) ) );        
    };    

    public showError = ( e: Error ): void => {
        this.write( e.message );
    };
    
    public write = ( ... args ): void => {
        //this._write( ... args );
        this._cli.newLine( ... args );
    };
        
}