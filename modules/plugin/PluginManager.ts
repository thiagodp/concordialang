import { Plugin } from 'concordialang-plugin';
import { toUnixPath } from '../util/file';
import { join } from 'path';

import { OldPluginData, PLUGIN_PREFIX, PluginData, sortPluginsByName } from './PluginData';
import { NewOrOldPluginData, PluginFinder } from './PluginFinder';

// import { loadPlugin } from 'load-plugin';

// import * as _url from 'url';
// const { pathToFileURL } = _url;

// //const { pathToFileURL } = require('url');
// const NATIVE_REQUIRE = eval('require');
// const NATIVE_IMPORT = (filepath) => import(filepath);
// const r = require('resolve');


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



// /**
//  * A utility function to use Node's native `require` or dynamic `import` to load CJS or ESM files
//  * @param {string} filepath
//  */
//  /*module.exports = */async function requireOrImport(filepath, { from = process.cwd() } = {}) {
//     return new Promise((resolve, reject) => {
//         // Resolve path based on `from`
//         const resolvedPath = r.sync(filepath, {
//             basedir: from
//         });
//         try {
//           const mdl = NATIVE_REQUIRE(resolvedPath);
//           resolve(mdl);
//         } catch (e) {
//           const url = pathToFileURL(resolvedPath);
//           console.log( 'url', url );
//         // const url = resolvedPath;
//           if (e instanceof SyntaxError && /export|import/.test(e.message)) {
//             console.error(`Failed to load "${filepath}"!\nESM format is not natively supported in "node@${process.version}".\nPlease use CommonJS or upgrade to an LTS version of node above "node@12.17.0".`)
//           }
//           return NATIVE_IMPORT(url.pathname.substring( 1 ) )
//             .then(mdl => resolve(mdl.default ? mdl.default : mdl))
//             .catch( reject );
//         }
//     })
// }


/**
 * Filter the given plug-ins by name.
 *
 * @param all Plug-ins
 * @param name Name to filter
 * @param partialComparison
 * @returns
 */
export async function filterPluginsByName( all: NewOrOldPluginData[], name: string, partialComparison: boolean = false ): Promise< NewOrOldPluginData | undefined > {

	const usualComparison = ( from: string, to: string ) => {
		return ( from === to )
			|| ( from === PLUGIN_PREFIX + to )
			|| ( PLUGIN_PREFIX + from === to );
	};

	const removeVersionFromName = ( name: string ) => {
		const index = name.lastIndexOf( '@' );
		if ( index < 0 ) {
			return name;
		}
		return name.substring( 0, index );
	};

	const compareNames = ( from: string, to: string, partialComparison: boolean ): boolean => {

		if ( partialComparison ) {
			return from.includes( to );
		}

		if ( usualComparison( from, to ) ) {
			return true;
		}

		return usualComparison( removeVersionFromName( from ), removeVersionFromName( to ) );
	};

	const lowerCasedName: string = name.toLowerCase();
	const withName = all.filter(
		v => compareNames( v.name.toLowerCase(), lowerCasedName, partialComparison ) );

	return withName.length > 0 ? withName[ 0 ] : undefined;
}


/**
 * Plug-in manager
 *
 * @author Thiago Delgado Pinto
 */
export class PluginManager {

    constructor( private readonly _finder: PluginFinder ) {
    }

    /**
     * Tries to load a plug-in and to return its instance.
     *
     * @param pluginData Plug-in data
     */
     public async load( pluginData: PluginData ): Promise< Plugin > {

        // console.log( 'WILL LOAD' );

        const old = pluginData as OldPluginData;
        const isOldPlugin = !! old.file;

        if ( isOldPlugin ) {
            // Dynamically require the file
            const pluginClassFileContext = require( old.file ); // NOTE: "file" is updated when the package is loaded
            // const pluginClassFileContext = await import( old.file ); // NOTE: "file" is updated when the package is loaded
            // Create an instance of the class
            const obj = createInstance( pluginClassFileContext, old.class, [] );
            return obj as Plugin;
        }

        // console.log( 'WILL REQUIRE -> ', pluginData.name, 'at', pluginData.main );

        // const P = ( await import( "./" + pluginData.main ) ).default;
        // const P = require( pluginData.main );

        // const plugin = await loadPlugin( pluginData.name );
        // const plugin = require( pluginData.name );


        // const file =  join( process.cwd(), pluginData.main );
        // const file =  toUnixPath( './' + pluginData.main );
		let file = toUnixPath( join( process.cwd(), pluginData.main ) );
		if ( file.includes( ':' ) ) { // Windows
			file = 'file:///' + file;
		}

        // console.log( 'file', file );
        // console.log( 'cwd', process.cwd() );
        // const plugin = require( file );
        try {
            let plugin = await import( file );
            // console.log( 'plugin', plugin );
			if ( plugin.default ) {
				plugin = plugin.default;
			}
            return plugin as Plugin;
        } catch( err ) {
            console.log( err );
            return;
        }
    }


    public async findAll(): Promise< NewOrOldPluginData[] > {
        const all = await this._finder.find();
        return sortPluginsByName( all );
    }

}

