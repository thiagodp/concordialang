import { Options } from "./Options";
import { CliHelp } from "./CliHelp";
import { CLI } from "./CLI";
import { isDefined } from "../util/TypeChecking";
import { relative, join } from "path";
import * as fs from 'fs';
import * as cosmiconfig from 'cosmiconfig';
import { promisify } from "util";
import * as crypto from 'crypto';
import { LocalDateTime, DateTimeFormatter } from 'js-joda';

type OptionsInfo = { config: any, filepath: string };

export class OptionsHandler {

    private _wasLoaded: boolean = false;
    private _options: Options = null;
    private _cfgFilePath: string = null;

    constructor(
        public appPath: string,
        public processPath: string,
        private _cli: CLI,
        private _meow: any,
        private _fs = fs
    ) {
        this._options = new Options( appPath, processPath );
    }

    /** Returns the current options. */
    get(): Options {
        return this._options;
    }

    /** Returns true whether the options were already loaded. */
    wasLoaded(): boolean {
        return this._wasLoaded;
    }

    /**
     * Load the configuration from the CLI and the configuration file (if
     * it exists). Returns a promise to the loaded options.
     */
    async load(): Promise< Options > {

        let optionsInfo = await this.loadOptionsInfo();

        let options: Options = new Options( this.appPath, this.processPath );
        options.import( optionsInfo.config );

        // Update seed
        this.updateSeed( options, this._cli );

        // Save
        this._wasLoaded = true;
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
            this._cfgFilePath = join( this.appPath, this._options.defaults.CFG_FILE_NAME );
        }

        const write = promisify( this._fs.writeFile );
        await write( this._cfgFilePath, JSON.stringify( obj, undefined, "\t" ) );

        this._cli.newLine(
            this._cli.symbolInfo,
            'Saved',
            this._cli.colorHighlight( this._cfgFilePath )
        );

        return obj;
    }

    private updateSeed( options: Options, cli: CLI ): void {

        if ( ! options.seed ) {
            options.isGeneratedSeed = true;
            options.seed =
                LocalDateTime.now().format( DateTimeFormatter.ofPattern( 'yyyy-MM-dd HH:mm' ) ).toString();
        }

        const shouldShow = ! options.help && ! options.about && ! options.version && ! options.newer
            && ! options.somePluginOption();

        if ( shouldShow ) {
            cli.newLine(
                cli.symbolInfo,
                options.isGeneratedSeed ? 'Generated seed' : 'Seed',
                cli.colorHighlight( options.seed )
            );
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

        if ( options.debug || options.verbose ) {
            cli.newLine( cli.symbolInfo, 'Real seed', cli.colorHighlight( options.realSeed ) );
        }
    }


    private async loadOptionsInfo(): Promise< OptionsInfo > {

        // CLI options are read firstly in order to eventually consider
        // some parameter before loading a configuration file, i.e., pass
        // some argument to `optionsFromConfigFile`.

        const cliOptions = this.optionsFromCLI();

        const cfg: { config: any, filepath: string } | null =
            await this.optionsFromConfigFile();

        const cfgFileOptions = ! cfg ? {} : cfg.config;

        const finalObj = Object.assign( cfgFileOptions, cliOptions );

        return { config: finalObj, filepath: ! cfg ? null : cfg.filepath };
    }

    private optionsFromCLI(): any {
        return this.adaptMeowObject( this._meow );
    }

    private adaptMeowObject( meowObj: any ): any {
        let obj = Object.assign( {}, meowObj.flags );
        const input = meowObj.input;
        if ( ! obj.directory && ( isDefined( input ) && 1 === input.length ) ) {
            obj.directory = input[ 0 ];
        }
        return obj;
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
            this._cli.newLine( this._cli.symbolWarning, 'Could not load the configuration file.', err.message );
        }

        if ( isDefined( fileConfig ) ) {
            const cfgFilePath = relative( process.cwd(), fileConfig.filepath );
            this._cli.newLine(
                this._cli.symbolInfo,
                'Configuration file loaded:',
                this._cli.colorHighlight( cfgFilePath )
            );
        }

        return fileConfig;
   }

}