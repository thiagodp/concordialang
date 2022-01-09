import { Plugin } from 'concordialang-plugin';

import { toUnixPath } from '../util/file';
import { OldPluginData, PluginData } from './PluginData';

/**
 * Loads a plug-in and returns its instance.
 *
 * @param pluginData Plug-in data
 */
export async function loadPlugin( pluginData: PluginData ): Promise< Plugin > {

	// OLD PLUG-IN STRUCTURE
	const old = pluginData as OldPluginData;
	const isOldPlugin: boolean = !! old.file;
	if ( isOldPlugin ) {
		if ( ! old.class ) {
			throw new Error( `Plugin "${pluginData.name}" did not specified the class name.` );
		}

		// NOTE: "file" receives the absolute path when the package is loaded
		if ( old.file!.includes( ':' ) ) { // Windows
			old.file = 'file:///' + old.file;
		}
		// Supported in ES2020+ but it worked flawlessly in ES2015/ES2018 (Node 10)
		// @ts-ignore
		const pluginClassFileContext = await import( old.file );
		const obj = createInstance( pluginClassFileContext, old.class, [] );
		return obj as Plugin;
	}

	// NEW PLUG-IN STRUCTURE
	let file = pluginData.main; // Absolute path
	if ( file.includes( ':' ) ) { // MS Windows
		file = 'file:///' + toUnixPath( file );
	}
	// Supported in ES2020+ but it worked flawlessly in ES2015/ES2018 (Node 10)
	// @ts-ignore
	let plugin = await import( file );
	if ( plugin.default ) {
		plugin = plugin.default;
	}
	return plugin as Plugin;
}


/**
 * Returns an instance of a given class name.
 *
 * @param context Object used as context.
 * @param className Class to be instantiated.
 * @param args Constructor arguments.
 * @return An instance of the given class.
 */
 function createInstance( context: any, className: string, args: any[] ): any {
	return new context[ className ]( ... args );
}
