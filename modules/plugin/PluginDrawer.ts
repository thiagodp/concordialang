import { CLI } from "../app/CLI";
import { PluginData } from "./PluginData";
import { sprintf } from 'sprintf-js';

/**
 * Draws plug-in related data.
 *
 * @author Thiago Delgado Pinto
 */
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
        this.write( this._cli.symbolInfo, sprintf( 'Plugin %s', highlight( p.name ) ) );
        this.write( sprintf( format, 'version', p.version ) );
        this.write( sprintf( format, 'description', p.description ) );
        this.write( sprintf( format, 'targets', p.targets.join( ', ' ) ) );
        this.write( sprintf( format, 'authors', authors.join( '\n') ) );
        if ( p.isFake ) {
            this.write( sprintf( format, 'fake', p.isFake ? 'yes': 'no' ) );
        }
        this.write( sprintf( format, 'file', p.file ) );
        this.write( sprintf( format, 'class', p.class ) );
    }

    public showMessagePluginNotFound( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolError,
            sprintf( 'No plugins installed with the name "%s".', highlight( name ) )
            );
    }

    public showMessagePluginAlreadyInstalled( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo,
            sprintf( 'The plugin %s is already installed.', highlight( name ) )
            );
    }

    public showMessageTryingToInstall( name: string, tool: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo,
            sprintf( 'Trying to install %s with %s.', highlight( name ), tool )
            );
    }

    public showMessageTryingToUninstall( name: string, tool: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo,
            sprintf( 'Trying to uninstall %s with %s.', highlight( name ), tool )
            );
    }

    public showMessageCouldNoFindInstalledPlugin( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo,
            sprintf( 'Could not find installed plug-in %s. Please try again.', highlight( name ) )
            );
    }

    public showMessagePackageFileNotFound( file: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolWarning,
            sprintf( 'Could not find %s. I will create it for you.', highlight( file ) )
            );
    }

    public showPluginInstallStart( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo,
            sprintf( 'Installing the plugin %s...', highlight( name ) )
            );
    }

    public showPluginUninstallStart( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo,
            sprintf( 'Uninstalling the plugin %s...', highlight( name ) )
            );
    }

    public showPluginServeStart( name: string ): void {
        const highlight = this._cli.colorHighlight;
        this.write( this._cli.symbolInfo,
            sprintf( 'Serving %s...', highlight( name ) )
            );
    }

    public showCommand( command: string ): void {
        this.write( '  Running', this._cli.colorHighlight( command ) );
    }

    public showCommandCode( code: number, showIfSuccess: boolean = true ): void {
        if ( 0 === code ) {
            if ( showIfSuccess ) {
                this.write( this._cli.symbolSuccess, 'Success' );
            }
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