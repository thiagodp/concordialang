import { CLI } from "../app/CLI";
import { PluginData } from "./PluginData";
import { sprintf } from 'sprintf-js';


export class PluginDrawer {

    constructor( private _cli: CLI ) {
    }

    public drawPluginList( plugins: PluginData[] ): void {
        if ( plugins.length < 1 ) {
            this.write( this._cli.symbolInfo, 'No plugins found. Try to install a plugin with NPM.' );
            return;
        }
        // const highlight = this._cli.colorHighlight;
        // const format = "%-20s %-8s %-22s"; // util.format does not support padding :(
        // this.write( highlight( sprintf( format, 'Name', 'Version', 'Description' ) ) );
        // for ( let p of plugins ) {
        //     this.write( sprintf( format, p.name, p.version, p.description ) );
        // }

        const highlight = this._cli.colorHighlight;
        const format = "%-15s";
        this.write( this._cli.symbolInfo, highlight( 'Available Plugins:' ) );
        for ( let p of plugins ) {
            this.write( ' ' );
            this.write( highlight( sprintf( format, '  Name' ) ), p.name );
            this.write( highlight( sprintf( format, '  Version' ) ), p.version );
            this.write( highlight( sprintf( format, '  Description' ) ), p.description );
        }
    }

    public drawSinglePlugin( p: PluginData ): void {
        const highlight = this._cli.colorHighlight;
        const format = "  - %-12s: %s"; // util.format does not support padding :(
        const authors = p.authors.map( ( a, idx ) => 0 === idx ? a : sprintf( '%-17s %s', '', a ) );
        this.write( this._cli.symbolInfo, 'Plugin ' + highlight( p.name ) );
        this.write( sprintf( format, 'version', p.version ) );
        this.write( sprintf( format, 'description', p.description ) );
        this.write( sprintf( format, 'targets', p.targets.join( ', ' ) ) );
        this.write( sprintf( format, 'authors', authors.join( '\n') ) );
        this.write( sprintf( format, 'fake', p.isFake ? 'yes': 'no' ) );
        this.write( sprintf( format, 'file', p.file ) );
        this.write( sprintf( format, 'class', p.class ) );
    }

    public showMessageOnNoPluginFound( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolError, 'No plugins found with the name "' + highlight( name ) + '".'
            + '\nTry ' + highlight( '--plugin-list' ) + ' to see the available plugins.' );
    }

    public showPluginInstallStart( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo, 'Installing the plugin ' + highlight( name ) + '...' );
    }

    public showPluginUninstallStart( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo, 'Uninstalling the plugin ' + highlight( name ) + '...' );
    }

    public showPluginServeStart( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo, 'Serving ' + highlight( name ) + '...' );
    }

    public showCommand( command: string ): void {
        this.write( '  Running', this._cli.colorHighlight( command ) );
    }

    public showCommandCode( code: number ): void {
        if ( 0 === code ) {
            this.write( this._cli.symbolSuccess, 'Success' );
        } else {
            this.write( this._cli.symbolError, 'Error during command execution.' );
        }
    }

    public showError( e: Error ): void {
        this.write( this._cli.symbolError, e.message );
    }

    public write( ... args ): void {
        //this._write( ... args );
        this._cli.newLine( ... args );
    }

}