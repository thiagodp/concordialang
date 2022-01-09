// console.log( '---> process.argv', process.argv );
import _case from 'case';
import { cosmiconfig } from 'cosmiconfig';
import { distance } from 'damerau-levenshtein-js';
import * as fs from 'fs';
import fsExtra from 'fs-extra';
import * as path from 'path';
import readPkgUp from 'read-pkg-up';
import semverDiff from 'semver-diff';
import { UpdateNotifier } from 'update-notifier';
import { promisify } from 'util';

import { runApp } from '../app/execution';
import { AppOptions } from '../app/options/app-options';
import { CliOnlyOptions, hasSomePluginAction } from '../app/options/cli-only-options';
import { createPersistableCopy } from '../app/options/options-exporter';
import { copyOptions } from '../app/options/options-importer';
import { makeAllOptions } from '../app/options/options-maker';
import { allInstalledDatabases } from '../db/database-package-manager';
import { availableLanguages } from '../language/data/map';
import { installedDateLocales } from '../language/locale-manager';
import { PackageBasedPluginFinder } from '../plugin';
import { bestMatch } from '../util/best-match';
import { DirSearcher } from '../util/file';
import { FSDirSearcher, FSFileHandler } from '../util/fs';
import {
    joinDatabasePackageNames,
    makeLockFileName,
    makePackageInstallCommand,
    makePackageUninstallCommand,
    PackageManager,
    packageManagers,
} from '../util/package-installation';
import { runCommand } from '../util/run-command';
import { parseArgs } from './cli-args';
import { helpContent } from './cli-help';
import { UI } from './cli-ui';
import { GuidedConfig, PromptOptions } from './guided-config';
import { PluginController } from './plugin-controller';
import { processPluginOptions } from './plugin-processor';


const { kebab } = _case;

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

	const unexpectedKeys: string[] = args && args.unexpected ? Object.keys( args.unexpected ) : [];
	if ( unexpectedKeys.length > 0 ) {

		const simi = ( a: string, b: string ): number => {
			const piecesA = a.split( /\-/g );
			const piecesB = b.split( /\-/g );
			const maxA = piecesA.length - 1;
			let i = 0;
			let totalDistance = 0.0000001;
			for ( const pB of piecesB ) {
				if ( i > maxA ) {
					break;
				}
				const pA = piecesA[ i ];
				if ( pA === pB ) {
					totalDistance += pA.length;
					++i;
					continue;
				}
				let x = 0;
				const pALen = pA.length;
				const pBLen = pB.length;
				do {
					if ( pA[ x ] === pB[ x ] ) {
						totalDistance += 1;
					}
					++x;
				} while ( x < pALen && x < pBLen );

				totalDistance += pALen - distance( pA, pB );

				totalDistance *= i + 1;

				++i;
			}
			return totalDistance;
		};

		if ( ! args.allFlags ) {
			return false;
		}

		// const similarity = ( a, b ) => 1/distance( a, b );
		const putDashes = t => '-'.repeat( 1 === t.length ? 1 : 2 ) + t;
		const flags = Array.from( new Set( args.allFlags.map( kebab ) ) );
		for ( const k of unexpectedKeys ) {
			const match = bestMatch( k, flags, simi );
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
    const ui = new UI( options.debug, options.verbose );

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
	} )?.packageJson || {};

    // Show about
    if ( options.about ) {
		const defaultAuthor = 'Thiago Delgado Pinto';
        ui.showAbout( {
			description: pkg.description || 'Concordia',
			version: pkg.version || '?',
			author: pkg.author ? pkg.author[ 'name' ] || defaultAuthor : defaultAuthor,
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
    const notifier = new UpdateNotifier(
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

	// LOAD CONFIG FILE OPTIONS

    let fileOptions: Record< string, any > = {};
    try {
        const startTime = Date.now();
        const MODULE_NAME = 'concordia';
        // @see https://github.com/davidtheclark/cosmiconfig
        const loadOptions = {
            stopDir: options.processPath
        };
        const explorer = cosmiconfig( MODULE_NAME, loadOptions );
		const cfg: { config: any, filepath: string } = ( await explorer.load( options.config! ) ) as any;
		fileOptions = { ...cfg.config };

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
        ui.announceCouldNotLoadConfigurationFile( ( err as Error ).message );
        // continue
	}

	// console.log( 'CLI', cliOptions );
	// console.log( 'FILE', fileOptions );

    // CLI options override file options
	const userOptions = Object.assign( {}, fileOptions || {}, cliOptions || {} );
	// console.log( 'USER', userOptions );

	// Override default options with user options
	const errors: string[] = copyOptions( userOptions as any, options );
	// console.log( 'OPTIONS', options );
	for ( const e of errors ) {
		console.log( e );
	}
	if ( errors.length > 0 ) {
		return false;
	}

	const fileHandler = new FSFileHandler( fs, promisify, options.encoding );

    // Init option ?
    if ( options.init ) {
        if ( fileOptions ) {
            ui.announceConfigurationFileAlreadyExists();
        } else {
			// Detect package managers' lock files
			const pkgManagers = packageManagers();
			const lockFileIndex = pkgManagers
				.map( tool => path.join( processPath, makeLockFileName( tool ) ) )
				.findIndex( fileHandler.existsSync );
			// Ignore the package manager prompt if its lock file was detected
			let promptOptions: PromptOptions | undefined;
			if ( lockFileIndex >= 0 ) {
				promptOptions = { packageManager: pkgManagers[ lockFileIndex ] };
			}
			const guidedOptions = await ( new GuidedConfig() ).prompt( promptOptions );

			const errors = copyOptions( guidedOptions as any, options );
			for ( const e of errors ) {
				console.log( e );
			}


			// Create the given directories whether they not exist
			try {
				await fsExtra.ensureDir( guidedOptions.directory );
			} catch {} // Ignore - the user can create it manually
			try {
				await fsExtra.ensureDir( guidedOptions.dirScript );
			} catch {} // Ignore - the user can create it manually
			try {
				await fsExtra.ensureDir( guidedOptions.dirResult );
			} catch {} // Ignore - the user can create it manually


            options.saveConfig = true;
            const packages = guidedOptions.databases || [];
            if ( packages.length > 0 ) {
				const cmd = makePackageInstallCommand(
					joinDatabasePackageNames( packages ),
					options.packageManager as PackageManager
				);
                ui.announceDatabasePackagesInstallationStarted( 1 === packages.length, cmd );
                let code: number = 0;
                for ( const pkg of packages ) {
                    const cmd = makePackageInstallCommand( pkg, options.packageManager as PackageManager );
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
            await writeF( file!, JSON.stringify( obj, undefined, "\t" ) );
            ui.announceConfigurationFileSaved( file! );
        } catch ( err ) {
            ui.showException( err as Error );
            // continue!
        }
    }

    if ( options.init && ! options.pluginInstall ) {
        return true;
	}

	// DATABASE

	if ( options.dbInstall ) {
		const databases = options.dbInstall.split( ',' ).map( d => d.trim() );
		const cmd = makePackageInstallCommand( joinDatabasePackageNames( databases ), options.packageManager as PackageManager );
		ui.announceDatabasePackagesInstallationStarted( 1 === databases.length, cmd );
		let code = 1;
		try {
			code = await runCommand( cmd );
		} catch {
		}
		ui.announceDatabasePackagesInstallationFinished( code );
		return 0 === code;
	}

	if ( options.dbUninstall ) {
		const databases = options.dbUninstall.split( ',' ).map( d => d.trim() );
		const cmd = makePackageUninstallCommand( joinDatabasePackageNames( databases ), options.packageManager as PackageManager );
		ui.announceDatabasePackagesUninstallationStarted( 1 === databases.length, cmd );
		let code = 1;
		try {
			code = await runCommand( cmd );
		} catch {
		}
		ui.announceDatabasePackagesUninstallationFinished( code );
		return 0 === code;
	}

	if ( options.dbList ) {
		try {
			const nodeModulesDir = path.join( processPath, 'node_modules' );
			const databases = await allInstalledDatabases(
				nodeModulesDir,
				new FSDirSearcher( fs, promisify )
			);
			ui.drawDatabases( databases );
			return true;
		} catch ( err ) {
			ui.showError( err as Error );
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
			ui.showError( err as Error );
			return false;
		}
	}

	// LANGUAGE

	if ( options.languageList ) {
		try {
			ui.drawLanguages( availableLanguages );
		} catch ( err ) {
			ui.showException( err as Error );
			return false;
		}
		return true;
	}

	// PLUGIN

	if ( hasSomePluginAction( options ) ) {

		const dirSearcher: DirSearcher = new FSDirSearcher( fs, promisify );

		const pluginFinder = new PackageBasedPluginFinder(
			options.processPath, fileHandler, dirSearcher );

		const pluginController: PluginController = new PluginController(
			options.packageManager!,
			ui,
			fileHandler
			);

		try {
			await processPluginOptions( options, pluginFinder, pluginController, ui );
		} catch ( err ) {
			ui.showException( err as Error );
			return false;
		}
		return true;
	}


	const { spec, success } = await runApp( { fs, path }, options, ui );

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
			ui.showErrorSavingAbstractSyntaxTree( options.ast, ( e as Error ).message );
			return false;
		}
		ui.announceAbstractSyntaxTreeIsSaved( options.ast );
		return true;
	}

	return success;
}
