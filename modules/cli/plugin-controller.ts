import inquirer from 'inquirer';
import { join } from 'path';

import { loadPlugin } from '../plugin/plugin-loader';
import { filterPluginsByName, NewOrOldPluginData, OldPluginData, PACKAGE_FILE } from '../plugin/PluginData';
import { PluginListener } from '../plugin/PluginListener';
import { FileReader } from '../util/file/FileReader';
import {
    makePackageInitCommand,
    makePackageInstallCommand,
    makePackageUninstallCommand,
    makePackageUpdateCommand,
    PackageManager,
} from '../util/package-installation';
import { runCommand } from '../util/run-command';


export class PluginController {

    constructor(
        private readonly _packageManagerName: string,
        private readonly _pluginListener: PluginListener,
        private readonly _fileReader: FileReader
        ) {
    }


    public async installByName( all: NewOrOldPluginData[], pluginData: NewOrOldPluginData, name: string ): Promise< void > {

        if ( pluginData ) { // already exists

            let answer = await inquirer.prompt( [
                {
                    type: 'confirm',
                    name: 'install',
                    message: 'Plug-in already installed. Do you want to try to install it again?'
                }
            ] );

            if ( ! answer.install ) {
                return;
            }

        } else { // plug-in does not exist

            // Check if package.json exists in the application directory

            let mustGeneratePackageFile: boolean = false;
            try {
                const path = join( process.cwd(), PACKAGE_FILE );

                const content: string | null = await this._fileReader.read( path );

                if ( ! content ) { // No package.json
                    mustGeneratePackageFile = true;
                    this._pluginListener.showMessagePackageFileNotFound( PACKAGE_FILE );
                }
            } catch ( err ) {
                mustGeneratePackageFile = true;
            }

            // Create package.json if it does not exist

            if ( mustGeneratePackageFile ) {
                const cmd = makePackageInitCommand( this._packageManagerName as PackageManager );  // e.g. 'npm init --yes';
                await this.runCommand( cmd );
            }
        }

        // Install the package as a DEVELOPMENT dependency
        const command = makePackageInstallCommand( name, this._packageManagerName as PackageManager )
        const code: number = await this.runCommand( command );
        if ( code !== 0 ) { // unsuccessful
            return;
        }

        // Check if it is installed
        pluginData = await filterPluginsByName( all, name, false );
        if ( ! pluginData ) {
            this._pluginListener.showMessageCouldNoFindInstalledPlugin( name );
        }
    }


    public async updateByName( name: string ): Promise< number > {
        const command = makePackageUpdateCommand( name, this._packageManagerName as PackageManager );
        return this.runCommand( command );
    }


    public async uninstallByName( name: string ): Promise< number > {
        // Uninstall the package
        const command = makePackageUninstallCommand( name, this._packageManagerName as PackageManager );
        return this.runCommand( command );
    }


    public async serve( pluginData: NewOrOldPluginData ): Promise< number > {

        let serveCommand: string;

        const old = pluginData as OldPluginData;
        const isOldPlugin = !! old.file;

        if ( isOldPlugin  ) {
            serveCommand = old.serve;
        } else {
            const plugin = await loadPlugin( pluginData );
            if ( ! plugin ) {
                throw new Error( 'Could not load the plug-in ' + ( pluginData?.name || '' ) );
            }
            serveCommand = plugin.serveCommand;
        }

        // Warn the user that no server command is available
        if ( ! serveCommand ) {
            this._pluginListener.showPluginServeUndefined( pluginData.name );
            return;
        }

        this._pluginListener.showPluginServeStart( pluginData.name );
        return this.runCommand( serveCommand );
    }

    // -------------------------------------------------------------------------

    private async runCommand( command: string ): Promise< number > {
        this._pluginListener.showCommandStarted( command );
        const code = await runCommand( command );
        this._pluginListener.showCommandFinished( code );
        return code;
    }

}
