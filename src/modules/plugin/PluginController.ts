import { PluginDrawer } from "./PluginDrawer";
import { Options } from "../app/Options";
import { PluginManager } from "./PluginManager";
import { TestScriptPluginData } from "./PluginData";
import { CLI } from "../app/CLI";


export class PluginController {

    private readonly _manager: PluginManager = new PluginManager();
    private readonly _drawer: PluginDrawer;

    constructor( cli: CLI ) {
        this._drawer = new PluginDrawer( cli );
    }

    public process = async ( options: Options ): Promise< boolean > => {
        
        if ( options.pluginList ) {
            try {
                this._drawer.drawPluginList( await this._manager.findAll() );
                return true;
            } catch ( e ) {
                this._drawer.showError( e );
                return false;
            }
        }

        // empty plugin name?
        if ( ! options.plugin || options.plugin.trim().length < 1 ) {
            this._drawer.showError( new Error( 'Empty plugin name.' ) );
            return false;
        }

        const pluginData = await this._manager.pluginWithName( options.plugin );
        // plugin name not available?        
        if ( ! pluginData ) {
            this._drawer.showMessageOnNoPluginFound( options.plugin );
            return false;
        }

        if ( options.pluginAbout ) {
            this._drawer.drawSinglePlugin( pluginData );
            return true;
        }  

        if ( options.pluginInstall ) {
            try {
                await this._manager.install( pluginData, this._drawer );
            } catch ( e ) {
                this._drawer.showError( e );
            }
            return true;
        }

        if ( options.pluginUninstall ) {
            try {
                await this._manager.uninstall( pluginData, this._drawer );
            } catch ( e ) {
                this._drawer.showError( e );
            }
            return true;
        }

        return true;
    };

}