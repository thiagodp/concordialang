import { AppOptions } from '../app/app-options';
import { CliOnlyOptions } from '../cli/CliOnlyOptions';
import { PluginListener } from './PluginListener';
import { PluginManager } from './PluginManager';

/**
 * Plugin controller
 *
 * @author Thiago Delgado Pinto
 */
export class PluginController {

    public process = async (
        options: AppOptions & CliOnlyOptions,
        pluginManager: PluginManager,
        drawer: PluginListener
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
                await pluginManager.installByName( options.plugin );
            } catch ( e ) {
                drawer.showError( e );
            }
            return true;
        }

        if ( options.pluginUninstall ) {
            try {
                await pluginManager.uninstallByName( options.plugin );
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
                await pluginManager.serve( pluginData );
            } catch ( e ) {
                drawer.showError( e );
            }
            return true;
        }

        return true;
    };

}
