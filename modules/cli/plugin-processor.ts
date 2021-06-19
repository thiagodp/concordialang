import { PLUGIN_PREFIX } from '../plugin/PluginData';
import { AppOptions } from '../app/app-options';
import { PluginListener } from '../plugin/PluginListener';
import { filterPluginsByName, PluginManager } from '../plugin/PluginManager';
import { CliOnlyOptions } from './CliOnlyOptions';
import { PluginController } from './PluginController';

export async function processPluginOptions(
	options: AppOptions & CliOnlyOptions,
	pluginManager: PluginManager,
	pluginController: PluginController,
	drawer: PluginListener
	): Promise< boolean > {


	if ( options.pluginList ) {
		try {
			drawer.drawPluginList( await pluginManager.findAll() );
			return true;
		} catch ( e ) {
			drawer.showError( e );
			return false;
		}
	}

	// Empty plugin name?
	if ( ! options.plugin || options.plugin.trim().length < 1 ) {
		drawer.showError( new Error( 'Empty plugin name.' ) );
		return false;
	}

	let pluginName: string = options.plugin;
	if ( ! pluginName.includes( PLUGIN_PREFIX ) ) {
		pluginName = PLUGIN_PREFIX + pluginName;
	}

	const all = await pluginManager.findAll();
	let pluginData = await filterPluginsByName( all, pluginName, false );

	// Installation (ok whether it exists or not)
	if ( options.pluginInstall ) {
		try {
			await pluginController.installByName( all, pluginData, pluginName );
		} catch ( e ) {
			drawer.showError( e );
		}
		return true;
	}

	// Plugin not found ?
	if ( ! pluginData ) {
		drawer.showMessagePluginNotFound( pluginName );
		return false;
	}

	if ( options.pluginUninstall ) {
		try {
			await pluginController.uninstallByName( pluginName );
		} catch ( e ) {
			drawer.showError( e );
		}
		return true;
	}

	if ( options.pluginAbout ) {
		drawer.drawSinglePlugin( pluginData );
		return true;
	}

	if ( options.pluginServe ) {
		try {
			await pluginController.serve( pluginData );
		} catch ( e ) {
			drawer.showError( e );
		}
		return true;
	}

	return true;
}




