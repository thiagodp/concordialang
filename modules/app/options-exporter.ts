import { relative } from 'path';

import { AppOptions } from './AppOptions';
import { CliOnlyOptions } from '../cli/CliOnlyOptions';

/**
 * Returns an object that can be saved.
 */
export function createPersistableCopy(
	source: AppOptions,
	defaultObject: AppOptions,
	useRelativePaths: boolean = false
): AppOptions {

	interface AdditionalKeys {
		databases: string;
	}

	const unwantedProperties: (keyof (AppOptions & CliOnlyOptions & AdditionalKeys))[] = [

		// INTERNAL
		'debug',
		'languageDir',
        'appPath',
		'processPath',

        'isGeneratedSeed',
        'realSeed',

		// LANGUAGE
        'languageList',

		// PLUGIN
        'pluginList',
        'pluginAbout',
        'pluginInstall',
        'pluginUninstall',
		'pluginServe',

		// DATABASE
		`dbList`,
        'dbInstall',
		'dbUninstall',

		'databases', // additional key

		// LOCALE
		'localeList',

        // PROCESSING
        'init',
        'saveConfig',
		'ast',

        // INFO
        'help',
        'about',
        'version',
        'newer',
	];

	const obj: AppOptions = Object.assign( {}, source );

	if ( obj.isGeneratedSeed ) {
		unwantedProperties.push( 'seed' );
	}

	if ( useRelativePaths ) {
		obj.directory = relative( obj.processPath, obj.directory );
		obj.dirResult = relative( obj.processPath, obj.dirResult );
		obj.dirScript = relative( obj.processPath, obj.dirScript );
	}

	// Remove properties with the same values as the default configuration

	for ( const [ k, d ] of Object.entries( defaultObject ) ) {

		const o = obj[ k ];
		// console.log( `'${k}' = '${o}'`);

		// Same value or empty
		if ( o === d || '' === o || '' === d ) {
			delete obj[ k ];
		// Both arrays and same values
		} else if ( Array.isArray( o ) && Array.isArray( d ) &&
			JSON.stringify( o ) === JSON.stringify( d )
		) {
			delete obj[ k ];
		}
	}

	// Remove unwanted properties
	for ( const p of unwantedProperties ) {
		delete obj[ p ];
	}

	return obj;
}
