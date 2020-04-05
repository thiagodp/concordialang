import { Options } from "../app/Options";
import { PluginDrawer } from "./PluginDrawer";
import { PluginManager } from "./PluginManager";

/**
 * Plugin controller
 *
 * @author Thiago Delgado Pinto
 */
export class PluginController {

    public process = async (
        options: Options,
        pluginManager: PluginManager,
        drawer: PluginDrawer
        ): Promise< boolean > => {

        if ( options.pluginList ) {
            try {
                drawer.drawPluginList( await pluginManager.findAll() );
                return true;
            } catch ( e ) {
                drawer.showError( e );
                return false;
            }
        }

        // empty plugin name?
        if ( ! options.plugin || options.plugin.trim().length < 1 ) {
            drawer.showError( new Error( 'Empty plugin name.' ) );
            return false;
        }

        if ( options.pluginInstall ) {
            try {
                await pluginManager.installByName( options.plugin, drawer );
            } catch ( e ) {
                drawer.showError( e );
            }
            return true;
        }

        if ( options.pluginUninstall ) {
            try {
                await pluginManager.uninstallByName( options.plugin, drawer );
            } catch ( e ) {
                drawer.showError( e );
            }
            return true;
        }

        const pluginData = await pluginManager.pluginWithName( options.plugin );
        // plugin name not available?
        if ( ! pluginData ) {
            drawer.showMessagePluginNotFound( options.plugin );
            return false;
        }

        if ( options.pluginAbout ) {
            drawer.drawSinglePlugin( pluginData );
            return true;
        }

        if ( options.pluginServe ) {
            try {
                await pluginManager.serve( pluginData, drawer );
            } catch ( e ) {
                drawer.showError( e );
            }
            return true;
        }

        return true;
    };

}