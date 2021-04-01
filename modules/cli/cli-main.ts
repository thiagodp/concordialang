// console.log( '---> process.argv', process.argv );
import { cosmiconfig } from 'cosmiconfig';
import { distance } from 'damerau-levenshtein-js';
import * as fs from 'fs';
import * as path from 'path';
import * as readPkgUp from 'read-pkg-up';
import * as semverDiff from 'semver-diff';
import * as updateNotifier from 'update-notifier';
import { promisify } from 'util';

import { App } from '../app/App';
import { AppOptions } from '../app/AppOptions';
import { copyOptions } from '../app/options-importer';
import { makeAllOptions } from '../app/options-maker';
import { createPersistableCopy } from '../app/options-exporter';
import { allInstalledDatabases, installDatabases, uninstallDatabases } from '../db/database-package-manager';
import { LanguageManager } from '../language/LanguageManager';
import { installedDateLocales } from '../language/locale-manager';
import { PackageBasedPluginFinder, PluginController, PluginManager } from '../plugin';
import { bestMatch } from '../util/best-match';
import { DirSearcher, FileSearcher } from '../util/file';
import { FSDirSearcher, FSFileHandler, FSFileSearcher } from '../util/fs';
import { makePackageInstallCommand } from '../util/package-installation';
import { runCommand } from '../util/run-command';
import { parseArgs } from './args';
import { helpContent } from './cli-help';
import { CliOnlyOptions, hasSomePluginAction } from './CliOnlyOptions';
import { GuidedConfig } from './GuidedConfig';
import { SimpleUI } from './SimpleUI';
import { VerboseUI } from './VerboseUI';


// Prevent caching of this module so module.parent is always accurate
// delete require.cache[__filename];
// const parentDir = path.dirname(module.parent.filename);


export async function main( appPath: string, processPath: string ): Promise< boolean > {

	let options: AppOptions & CliOnlyOptions =
		makeAllOptions( appPath, processPath );

	// Parse CLI arguments
	// console.log( process.argv );
	const args = parseArgs( process.argv.slice( 2 ) );
	// console.log( 'ARGS:', args );

	// Show invalid options whether needed
	const unexpectedKeys: string[] = args && args.unexpected
		? Object.keys( args.unexpected )
		: [];
	if ( unexpectedKeys.length > 0 ) {
		const similarity = ( a, b ) => 1/distance( a, b );
		const putDashes = t => '-'.repeat( 1 === t.length ? 1 : 2 ) + t;
		for ( const k of unexpectedKeys ) {
			const match = bestMatch( k, args.allFlags, similarity );
			const dK = putDashes( k );
			if ( ! match ) {
				console.log( `Invalid option: "${dK}"` );
				continue;
			}
			const dMatch = putDashes( match.value );
			console.log( `Invalid option: "${dK}". Did you mean "${dMatch}"?` );
		}
		return false;
	}

	// Copy parsed arguments to options

    const cliOptions = args.flags; // Object.assign( {}, args.flags ); // copy
    try {
        // Adapt to look like Options
        const input = args.input;
        if ( ! cliOptions.directory && input && 1 === input.length ) {
            cliOptions.directory = input[ 0 ];
		}
		const errors: string[] = copyOptions( cliOptions as any, options );
		for ( const e of errors ) {
			console.log( e );
		}
		if ( errors.length > 0 ) {
			return false;
		}
    } catch {
        // continue
	}
	// console.log( 'OPTIONS:', options );

    // Start UI
    const ui = options.verbose
        ? new VerboseUI( options.debug )
        : new SimpleUI( options.debug );

    // Show help
    if ( options.help ) {
        ui.showHelp( helpContent() );
        return true;
	}

	// Retrieve package data
	const parentDir = path.dirname( appPath );
	const pkg = readPkgUp.sync( {
		cwd: parentDir,
		normalize: false
	} ).packageJson || {};

    // Show about
    if ( options.about ) {
        ui.showAbout( {
			description: pkg.description || 'Concordia',
			version: pkg.version || '?',
			author: pkg.author[ 'name' ] || 'Thiago Delgado Pinto',
			homepage: pkg.homepage || 'https://concordialang.org'
		});
        return true;
    }

    // Show version
    if ( options.version ) {
        ui.showVersion( pkg.version || '?' );
        return true;
	}

    // Check for updates
    const notifier = updateNotifier(
        {
            pkg,
            updateCheckInterval: 1000 * 60 * 60 * 12 // 12 hours
        }
    );
    notifier.notify(); // display a message only if an update is available

    if ( !! notifier.update ) {
        const diff = semverDiff( notifier.update.current, notifier.update.latest );
        const hasBreakingChange: boolean = 'major' === diff;
        const url = 'https://github.com/thiagodp/concordialang/releases';
        ui.announceUpdateAvailable( url, hasBreakingChange );
	}

    // Newer option ?
    if ( options.newer ) {
        if ( ! notifier.update ) {
            ui.announceNoUpdateAvailable();
        }
        return true;
    }

	// DATABASE

	if ( options.dbInstall ) {
		const databases = options.dbInstall.split( ',' ).map( d => d.trim() );
		ui.announceDatabasePackagesInstallationStarted( 1 === databases.length );
		let code = 1;
		try {
			code = await installDatabases( databases );
		} catch {
		}
		ui.announceDatabasePackagesInstallationFinished( code );
		return 0 === code;
	}

	if ( options.dbUninstall ) {
		const databases = options.dbUninstall.split( ',' ).map( d => d.trim() );
		ui.announceDatabasePackagesUninstallationStarted( 1 === databases.length );
		let code = 1;
		try {
			code = await uninstallDatabases( databases );
		} catch {
		}
		ui.announceDatabasePackagesUninstallationFinished( code );
		return 0 === code;
	}

	if ( options.dbList ) {
		let databases = [];
		try {
			const nodeModulesDir = path.join( processPath, 'node_modules' );
			databases = await allInstalledDatabases(
				nodeModulesDir,
				new FSDirSearcher( fs, promisify )
			);
			ui.drawDatabases( databases );
			return true;
		} catch ( err ) {
			ui.showError( err );
			return false;
		}
	}

	// LOCALE

	if ( options.localeList ) {

		// For now, only date locales are detected
		try {
			const nodeModulesDir = path.join( processPath, 'node_modules' );
			const dateLocales = await installedDateLocales(
				nodeModulesDir,
				new FSDirSearcher( fs, promisify ),
				path
			);
			ui.drawLocales( dateLocales, 'date',
				'Unavailable locales fallback to the their language. Example: "es-AR" fallbacks to "es".' );
			return true;
		} catch ( err ) {
			ui.showError( err );
			return false;
		}
	}

	// LANGUAGE

	if ( options.languageList ) {

		const fileSearcher: FileSearcher = new FSFileSearcher( fs );

		const lm = new LanguageManager( fileSearcher, options.languageDir );
		try {
			const languages: string[] = await lm.availableLanguages();
			ui.drawLanguages( languages );
		} catch ( err ) {
			ui.showException( err );
			return false;
		}
		return true;
	}


	// LOAD CONFIG FILE OPTIONS

    let fileOptions = null;
    try {
        const startTime = Date.now();
        const MODULE_NAME = 'concordia';
        // @see https://github.com/davidtheclark/cosmiconfig
        const loadOptions = {
            stopDir: options.processPath
        };
        const explorer = cosmiconfig( MODULE_NAME, loadOptions );
        const cfg: { config: any, filepath: string } = await explorer.load( options.config );
		fileOptions = cfg.config;

		// ADAPT KEYS

		// wanted, variation1, variation2, ...
		const optionsToConvert = [
			[ 'dirResult', 'dirResults' ],
			[ 'dirScript', 'dirScripts' ],
		];

		// Adapt
		for ( const [ wanted, ...variations ] of optionsToConvert ) {
			for ( const v of variations ) {
				if ( fileOptions[ v ] ) {
					fileOptions[ wanted ] = fileOptions[ v ];
					delete fileOptions[ v ];
				}
			}
		}

        const durationMS = Date.now() - startTime;
        ui.announceConfigurationFileLoaded( cfg.filepath, durationMS );
    } catch ( err ) {
        // console.log( '>>', options.config, 'ERROR', err.message );
        ui.announceCouldNotLoadConfigurationFile( err.message );
        // continue
	}

	// console.log( 'CLI', cliOptions );
	// console.log( 'FILE', fileOptions );

    // CLI options override file options
	const userOptions = Object.assign( {}, fileOptions || {}, cliOptions || {} );
	// console.log( 'USER', userOptions );

	// Override default options with user options
	const errors: string[] = copyOptions( userOptions, options );
	// console.log( 'OPTIONS', options );
	for ( const e of errors ) {
		console.log( e );
	}
	if ( errors.length > 0 ) {
		return false;
	}

    // Init option ?
    if ( options.init ) {
        if ( fileOptions ) {
            ui.announceConfigurationFileAlreadyExists();
        } else {
			const guidedOptions = await ( new GuidedConfig() ).prompt();

			const errors = copyOptions( guidedOptions as any, options );
			for ( const e of errors ) {
				console.log( e );
			}

            options.saveConfig = true;
            const packages = guidedOptions.databases || [];
            if ( packages.length > 0 ) {
                ui.announceDatabasePackagesInstallationStarted();
                let code: number;
                for ( const pkg of packages ) {
                    ui.announceDatabasePackage( pkg );
                    const cmd = makePackageInstallCommand( pkg );
                    code = await runCommand( cmd );
                    if ( code !== 0 ) {
                        break;
                    }
                }
                ui.announceDatabasePackagesInstallationFinished( code );
            }
        }
    }

    // Save config option ?
    if ( options.saveConfig ) {
		const writeF = promisify( fs.writeFile );

		const defaultOptions: AppOptions & CliOnlyOptions =
			makeAllOptions( appPath, processPath );

		const obj = createPersistableCopy( options, defaultOptions, true );
        const file = options.config;
        try {
            await writeF( file, JSON.stringify( obj, undefined, "\t" ) );
            ui.announceConfigurationFileSaved( file );
        } catch ( err ) {
            ui.showException( err );
            // continue!
        }
    }

    if ( options.init && ! options.pluginInstall ) {
        return true;
	}

	const fileHandler = new FSFileHandler( fs, promisify, options.encoding );

	// PLUGIN

	if ( hasSomePluginAction( options ) ) {

		const dirSearcher: DirSearcher = new FSDirSearcher( fs, promisify );

		const pluginFinder = new PackageBasedPluginFinder(
			options.processPath, fileHandler, dirSearcher );

		const pluginManager: PluginManager = new PluginManager(
			ui,
			pluginFinder,
			fileHandler
			);

		const pluginController: PluginController = new PluginController();

		try {
			await pluginController.process( options, pluginManager, ui );
		} catch ( err ) {
			ui.showException( err );
			return false;
		}
		return true;
	}


    const app = new App( fs, path, promisify );
	const { spec, success } = await app.start( options, ui );

	// AST

	if ( spec && options.ast ) {

		const getCircularReplacer = () => {
			const seen = new WeakSet();
			return ( /* key , */ value ) => {
				if ( 'object' === typeof value && value !== null ) {
					if ( seen.has( value ) ) {
						return;
					}
					seen.add( value );
				}
				return value;
			};
		};

		try {
			await fileHandler.write( options.ast, JSON.stringify( spec, getCircularReplacer(), "  " ) );
		} catch ( e ) {
			ui.showErrorSavingAbstractSyntaxTree( options.ast, e.message );
			return false;
		}
		ui.announceAbstractSyntaxTreeIsSaved( options.ast );
		return true;
	}

	return success;
}
