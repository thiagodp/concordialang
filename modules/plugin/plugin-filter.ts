import { NewOrOldPluginData, PLUGIN_PREFIX } from "./PluginData";

/**
 * Filter the given plug-ins by one or more names.
 *
 * @param all Plug-ins to filter.
 * @param nameOrNames Name or names to search. It accepts a string with comma-separated values or a string array.
 * @param partialComparison Flag that indicates to use partial comparison. Optional, `false` by default.
 * @param pluginPrefix Plug-in prefix. Optional, receives the value from the constant `PLUGIN_PREFIX` by default.
 * @returns
 */
 export function filterPluginsByName(
	all: NewOrOldPluginData[],
	nameOrNames: string | string[],
	partialComparison: boolean = false,
	pluginPrefix: string = PLUGIN_PREFIX,
): NewOrOldPluginData[] {

	let pluginNames: string[];
	if ( typeof nameOrNames === 'string' ) {

		if ( ! nameOrNames.includes( ',' ) ) {
			return all.filter( pluginData => arePluginNamesEqual( pluginData.name, nameOrNames, partialComparison, pluginPrefix ) );
		}

		pluginNames = nameOrNames.split( ',' );
	} else {
		pluginNames = nameOrNames;
	}

	pluginNames = pluginNames.filter( n => n && typeof n === 'string' ); // Removes empty or non-string values

	const found: NewOrOldPluginData[] = [];
	for ( const p of all ) {
		for ( const name of pluginNames ) {
			if ( arePluginNamesEqual( p.name, name, partialComparison, pluginPrefix ) ) {
				found.push( p );
			}
		}
	}
	return found;
}


export function removeVersionFromPackageName( name: string ): string {
	const index = name.lastIndexOf( '@' );
	if ( index < 0 ) {
		return name;
	}
	return name.substring( 0, index );
}


export function areNamesConsideredEqual( name1: string, name2: string, prefix: string ): boolean {
	const [ n1, n2 ] = [ name1.trim().toLowerCase(), name2.trim().toLowerCase() ];
	return ( n1 === n2 )
		|| ( n1 === prefix + n2 )
		|| ( prefix + n1 === n2 );
}


export function arePluginNamesEqual( name1: string, name2: string, partialComparison: boolean, prefix: string ): boolean {

	if ( partialComparison && ( name1.includes( name2 ) || name2.includes( name1 ) ) ) {
		return true;
	}

	if ( areNamesConsideredEqual( name1, name2, prefix ) ) {
		return true;
	}

	return areNamesConsideredEqual(
		removeVersionFromPackageName( name1 ),
		removeVersionFromPackageName( name2 ),
		prefix
	);
}
