import { DateTimeFormatter, LocalDateTime } from '@js-joda/core';
import * as cosmiconfig from 'cosmiconfig';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { join, relative } from 'path';
import { promisify } from 'util';

import { Options } from '../app/Options';
import { OptionsListener } from '../app/OptionsListener';
import { isDefined } from '../util/TypeChecking';


type OptionsInfo = { config: any, filepath: string };

export class OptionsHandler {

    private _wasLoaded: boolean = false;
    private _options: Options = null;
    private _cfgFilePath: string = null;

    constructor(
        public appPath: string,
        public processPath: string,
        private _optionsListener: OptionsListener,
        private _fs = fs
    ) {
        this._options = new Options( appPath, processPath );
    }

    /** Returns the current options. */
    get(): Options {
        return this._options;
    }

    /** Sets the current options */
    set( options: Options ): void {
        this._options = options;
    }

    /** Returns true whether the options were already loaded. */
    wasLoaded(): boolean {
        return this._wasLoaded;
    }

    /**
     * Load the configuration from the CLI and the configuration file (if
     * it exists). Returns a promise to the loaded options.
     */
    async load( cliOptions: any ): Promise< Options > {

        let optionsInfo = await this.loadOptionsInfo( cliOptions );

        let options: Options = new Options( this.appPath, this.processPath );
        options.import( optionsInfo.config );

        // Update seed
        this.updateSeed( options );

        // Save loaded parameters
        this._cfgFilePath = optionsInfo.filepath; // may be null
        this._options = options;

        return options;
    }

    /**
     * Save the configuration. Returns a promise to the saved object.
     */
    async save(): Promise< any > {
        const obj = this._options.export();

        if ( ! this._cfgFilePath ) {
            this._cfgFilePath = join( this.processPath, this._options.defaults.CFG_FILE_NAME );
        }

        const write = promisify( this._fs.writeFile );
        await write( this._cfgFilePath, JSON.stringify( obj, undefined, "\t" ) );

        this._optionsListener.announceConfigurationFileSaved( this._cfgFilePath );

        return obj;
    }

    private updateSeed( options: Options ): void {

        if ( ! options.seed ) {
            options.isGeneratedSeed = true;
            options.seed =
                LocalDateTime.now().format( DateTimeFormatter.ofPattern( 'yyyy-MM-dd HH:mm:ss' ) ).toString();
        }

        const shouldShow = ! this.hasOptionAffectedByConfigurationFile( options )
            && ! options.newer
            && ! options.init
            && ! options.ast
            && ! options.somePluginOption();

        if ( shouldShow ) {
            this._optionsListener.announceSeed( options.seed, options.isGeneratedSeed );
        }

        // Real seed
        const BYTES_OF_SHA_512 = 64; // 512 divided by 8
        if ( options.seed.length < BYTES_OF_SHA_512 ) {
            options.realSeed = crypto
                .createHash( 'sha512' )
                .update( options.seed )
                .digest( 'hex' );
        } else {
            options.realSeed = options.seed;
        }

        this._optionsListener.announceRealSeed( options.realSeed );
    }

    private hasOptionAffectedByConfigurationFile( options: Options ): boolean {
        return ! options.help
            && ! options.about
            && ! options.version
            && ! options.newer
            && ! options.languageList
            && ! options.pluginList
            ;
    }


    private async loadOptionsInfo( cliOptions: any ): Promise< OptionsInfo > {

        // CLI options are read firstly in order to eventually consider
        // some parameter before loading a configuration file, i.e., pass
        // some argument to `optionsFromConfigFile`.

        let cfg: { config: any, filepath: string } | null = null;

        if ( this.hasOptionAffectedByConfigurationFile( cliOptions ) ) {
            cfg = await this.optionsFromConfigFile();
            if ( !! cfg ) {
                this._wasLoaded = true;
            }
        }

        const cfgFileOptions = ! cfg ? {} : cfg.config;

        const finalObj = Object.assign( cfgFileOptions, cliOptions );

        return { config: finalObj, filepath: ! cfg ? null : cfg.filepath };
    }


   private async optionsFromConfigFile(): Promise< OptionsInfo | null > {
        const MODULE_NAME = 'concordia';
        // @see https://github.com/davidtheclark/cosmiconfig
        // const loadOptions = {
        //     stopDir: process.cwd()
        // };
        const explorer = cosmiconfig( MODULE_NAME );
        let fileConfig = null;
        try {
            fileConfig = await explorer.load();
        } catch ( err ) {
            this._optionsListener.announceCouldNotLoadConfigurationFile( err.message );
        }

        if ( isDefined( fileConfig ) ) {
            const cfgFilePath = relative( process.cwd(), fileConfig.filepath );
            this._optionsListener.announceConfigurationFileLoaded( cfgFilePath );
        }

        return fileConfig;
   }

}