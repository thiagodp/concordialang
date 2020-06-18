import { cosmiconfig } from 'cosmiconfig';
import * as fs from 'fs';
import * as meow from 'meow';
import * as path from 'path';
import * as semverDiff from 'semver-diff';
import * as updateNotifier from 'update-notifier';
import { promisify } from 'util';

import { App, Options } from '../app';
import { allInstalledDatabases, installDatabases, uninstallDatabases } from '../db/database-package-manager';
import { FSDirSearcher } from '../util/file';
import { makePackageInstallCommand } from '../util/package-installation';
import { runCommand } from '../util/run-command';
import { CliHelp } from './CliHelp';
import { GuidedConfig } from './GuidedConfig';
import { SimpleUI } from './SimpleUI';
import { VerboseUI } from './VerboseUI';


export async function main( appPath: string, processPath: string ): Promise< boolean > {

    const options = new Options( appPath, processPath );

    // Load CLI options
    const cliHelp: CliHelp = new CliHelp();
    const meowResult = meow( cliHelp.content(), cliHelp.meowOptions() );
    let cliOptions = {};
    try {
        // Adapt to look like Options
        const obj = Object.assign( {}, meowResult.flags ); // copy
        const input = meowResult.input;
        if ( ! obj.directory && input && 1 === input.length ) {
            obj.directory = input[ 0 ];
        }

        cliOptions = obj;
        options.import( cliOptions );
    } catch {
        // continue
    }

    // Start UI
    const ui = options.verbose
        ? new VerboseUI( meowResult, options.debug )
        : new SimpleUI( meowResult, options.debug );

    // Show help ?
    if ( options.help ) {
        ui.showHelp();
        return true;
    }

    // Show about ?
    if ( options.about ) {
        ui.showAbout();
        return true;
    }

    // Show version ?
    if ( options.version ) {
        ui.showVersion();
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
				new FSDirSearcher( fs )
			);
			ui.drawDatabases( databases );
			return true;
		} catch ( err ) {
			ui.showError( err );
			return false;
		}
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
        const durationMS = Date.now() - startTime;
        ui.announceConfigurationFileLoaded( cfg.filepath, durationMS );
    } catch ( err ) {
        // console.log( '>>', options.config, 'ERROR', err.message );
        ui.announceCouldNotLoadConfigurationFile( err.message );
        // continue
    }

    // CLI options override file options
    const userOptions = Object.assign( fileOptions || {}, cliOptions || {} );
    options.import( userOptions );

    // Init option ?
    if ( options.init ) {
        if ( fileOptions ) {
            ui.announceConfigurationFileAlreadyExists();
        } else {
            const guidedOptions = await ( new GuidedConfig() ).prompt();
            options.import( guidedOptions );
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
        const obj = options.export();
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

    // Check for updates

    const pkg = meowResult.pkg; // require( './package.json' );
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

    const app = new App( fs, path );
    return await app.start( options, ui );
}
