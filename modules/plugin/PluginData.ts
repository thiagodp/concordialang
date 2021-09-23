
/**
 * Package file
 */
export const PACKAGE_FILE = 'package.json';

/**
 * Property that must be declared in a package file of a plugin.
 */
export const PLUGIN_PROPERTY: string = 'concordiaPlugin';

/**
 * Prefix for plug-ins.
 */
export const PLUGIN_PREFIX: string = 'concordialang-';

/**
 * Plugin data.
 *
 * @author Thiago Delgado Pinto
 */
export interface PluginData {

    name: string;

    description: string;

    version: string;

    authors: string[];

	/** Plug-in entry point (file) */
    main: string;

}

/**
 * Additional data from the property `concordiaPlugin` for version 2.
 *
 * TO-DO: remove before version 2 is released.
 */
interface OldPluginPropertyData {

    /** Path to file to be loaded. */
    file?: string;

    /** Class that implements the interface `Plugin`. */
    class?: string;

    /** Command to start a testing server, whether needed. */
    serve?: string;
}

/**
 * Old plug-in structure for version 2.
 *
 * TO-DO: remove before version 2 is released.
 */
export interface OldPluginData extends PluginData, OldPluginPropertyData {
}

/**
 * Plug-in structures (old and new).
 */
export type NewOrOldPluginData = PluginData | OldPluginData;


/** Author object from `package.json` */
type Author = { name: string, email?: string, url?: string, site?: string };


/**
 * Sort plug-ins by name
 *
 * @param plugins Plug-in data to sort
 * @returns
 */
export function sortPluginsByName( plugins: PluginData[] ): PluginData[] {
	return plugins.sort( ( a: PluginData, b: PluginData ): number => {
		return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
	} );
}


/**
 * Returns a string array from the property `author` or `authors` of `package.json`.
 * Input value can be string, Author, array of string or array of Author.
 *
 * @param author Author or authors
 * @returns
 */
export function authorsAsStringArray(
    author?: string | Author | string[] | Author[]
): string[] {
    switch ( typeof author ) {
        case 'string': return [ author ];
        case 'object': {
            const authorObjectToString = ( obj?: Author ): string | undefined => {
                if ( ! obj || typeof obj != 'object' ) {
                    return; // undefined
                }
                const emailOrSite = ( obj.email || obj.url || obj.site ) ? ` <${obj.email || obj.url || obj.site}>` : '';
                return obj.name + emailOrSite;
            };
            if ( Array.isArray( author ) ) {
                if ( author.length < 1 ) {
                    return [];
                }
                if ( typeof author[ 0 ] === 'string' ) {
                    return author as string[];
                }
                return ( author as Author [] ).map( authorObjectToString ).filter( a => !!a );
            }
            return [ authorObjectToString( author ) ];
        }
        default: return [];
    }
}


/**
 * Returns `true` if the given object is a Concordia Compiler plugin.
 *
 * @param pkg Package object
 * @returns
 */
export function isPlugin( pkg?: { name?: string, version?: string, concordiaPlugin?: any } ): boolean {
    return !! pkg && pkg?.name?.startsWith( PLUGIN_PREFIX ) && !! pkg[ PLUGIN_PROPERTY ];
}

/**
 * Extracts plug-in data from a package object.
 *
 * @param pkg Package object
 * @returns
 */
export function pluginDataFromPackage( pkg: any ): PluginData | OldPluginData | undefined {
    if ( ! pkg ) {
        return;
    }
    const data = {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        authors: authorsAsStringArray( pkg.author || pkg.authors ),
        main: pkg.main,
    } as PluginData;

    if ( ! isOldPluginForVersion2( pkg ) ) {
        return data;
    }

    const obj = concordiaPluginPropertyValue( pkg ) as OldPluginPropertyData;

    return { ...data, ...obj } as OldPluginData;
}


/**
 * Returns `true` if the given object is an old plugin structure for version 2.
 * @param pkg Package object
 * @returns
 */
 export function isOldPluginForVersion2( pkg: any ): boolean {
    if ( ! isPlugin( pkg ) ) {
        return false;
    }
    const prop = concordiaPluginPropertyValue( pkg );
    return typeof prop === 'object';
}


/**
 * Returns the value for the property `concordiaPlugin`.
 *
 * @param pkg Package object
 * @returns
 */
function concordiaPluginPropertyValue( pkg: any ): boolean | OldPluginPropertyData | undefined {
    return ( pkg && pkg[ PLUGIN_PROPERTY ] ) ? pkg[ PLUGIN_PROPERTY ] : undefined;
}
