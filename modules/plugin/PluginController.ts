import { PluginDrawer } from "./PluginDrawer";
import { Options } from "../app/Options";
import { PluginManager } from "./PluginManager";
import { CLI } from "../app/CLI";

/**
 * Plugin controller
 *
 * @author Thiago Delgado Pinto
 */
export class PluginController {

    private readonly _drawer: PluginDrawer;

    constructor( cli: CLI ) {
        this._drawer = new PluginDrawer( cli );
    }

    public process = async ( options: Options ): Promise< boolean > => {

        const pm = new PluginManager( options.pluginDir );

        if ( options.pluginList ) {
            try {
                this._drawer.drawPluginList( await pm.findAll() );
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

        const pluginData = await pm.pluginWithName( options.plugin );
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
                await pm.install( pluginData, this._drawer );
            } catch ( e ) {
                this._drawer.showError( e );
            }
            return true;
        }

        if ( options.pluginUninstall ) {
            try {
                await pm.uninstall( pluginData, this._drawer );
            } catch ( e ) {
                this._drawer.showError( e );
            }
            return true;
        }

        if ( options.pluginServe ) {
            try {
                await pm.serve( pluginData, this._drawer );
            } catch ( e ) {
                this._drawer.showError( e );
            }
            return true;
        }

        return true;
    };

}