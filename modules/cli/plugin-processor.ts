import { AppOptions } from '../app/options/app-options';
import { CliOnlyOptions } from '../app/options/cli-only-options';
import { filterPluginsByName } from '../plugin/plugin-filter';
import { addPluginPrefixIfNeeded, sortPluginsByName, splitPluginNames } from '../plugin/PluginData';
import { PluginFinder } from '../plugin/PluginFinder';
import { PluginListener } from '../plugin/PluginListener';
import { PluginController } from './plugin-controller';

export async function processPluginOptions(
	options: AppOptions & CliOnlyOptions,
	pluginFinder: PluginFinder,
	pluginController: PluginController,
	drawer: PluginListener
): Promise< void > {

	if ( options.pluginList ) {
		try {
			const plugins = sortPluginsByName( await pluginFinder.find() );
			drawer.drawPluginList( plugins );
		} catch ( e ) {
			drawer.showError( e as Error  );
			return;
		}
	}

	// Empty plugin name?
	if ( ! options.plugin ||
		( typeof options.plugin === 'string' && options.plugin.trim().length < 1 ) ||
		options.plugin.length < 1
	) {
		drawer.showError( new Error( 'Empty plugin name.' ) );
		return;
	}

	const pluginNames: string[] = ( ( typeof options.plugin === 'string' )
		? splitPluginNames( options.plugin )
		: options.plugin ).map( addPluginPrefixIfNeeded );

	const existingPlugins = await pluginFinder.find();

	const filteredPlugins = await filterPluginsByName( existingPlugins, pluginNames, false );

	// No plug-ins were found
	if ( filteredPlugins.length < 1 ) {
		drawer.showMessageNoPluginsFound( pluginNames );
		return;
	}

	// Process each plug-in

	for ( const pluginData of filteredPlugins ) {
		const name = pluginData.name;
		try {
			if ( options.pluginInstall ) {
				await pluginController.installByName(
					existingPlugins, pluginData, name ); // It's ok whether it exists or not
			} else if ( options.pluginUpdate ) {
				await pluginController.updateByName( name );
			} else if ( options.pluginUninstall ) {
				await pluginController.uninstallByName( name );
			} else if ( options.pluginAbout ) {
				drawer.drawSinglePlugin( pluginData );
			} else if ( options.pluginServe ) {
				await pluginController.serve( pluginData );
			}
		} catch ( e ) {
			drawer.showError( e as Error );
		}
	}
}
