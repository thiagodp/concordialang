
export interface CliOnlyOptions {

	// LANGUAGE

	/** Show available languages */
	languageList?: boolean;

	// LOCALE

	/** Show available locales */
	localeList?: boolean;

    // PLUGIN

    /** Show available plug-ins */
    pluginList?: boolean;
    /** Show information about a plug-in */
    pluginAbout?: string;
    /** Install an available plug-in */
    pluginInstall?: string;
    /** Update an available plug-in */
    pluginUpdate?: string;
    /** Uninstall an available plug-in */
    pluginUninstall?: string;
    /** Start the test server of a plug-in */
	pluginServe?: string;

	// DATABASE

	/** Show available databases */
	dbList?: boolean;
    /** Install a database */
    dbInstall?: string;
    /** Uninstall a database */
	dbUninstall?: string;

	// PROCESSING

    /** Whether it is wanted to execute a guided configuration */
    init?: boolean;
    /** Whether it is desired to save/overwrite a configuration file */
    saveConfig?: boolean;
    /** Generates an AST file instead of executing anything else */
	ast?: string;
	/** Configuration file */
	config?: string;

	// TEST EXECUTION

	x?: boolean; // alias to --no-run

	justSpec?: boolean;
	justTestCase?: boolean;
	justScript?: boolean;
	justRun?: boolean;
	justResult?: boolean;

	// INFO

    help?: boolean; // show help
    about?: boolean; // show about
    version?: boolean; // show version
    newer?: boolean; // check for version updates

}


export function hasSomePluginAction( o: CliOnlyOptions ): boolean {
	return o.pluginList
		|| !! o.pluginAbout
		|| !! o.pluginInstall
		|| !! o.pluginUpdate
		|| !! o.pluginUninstall
		|| !! o.pluginServe;
}
