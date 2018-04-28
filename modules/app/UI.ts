import { CLI } from "./CLI";
import { CliHelp } from "./CliHelp";
import { Options } from "./Options";
import * as meow from 'meow';
import * as cosmiconfig from 'cosmiconfig';
import { isDefined } from "../util/TypeChecking";
import { relative } from "path";

export class UI {

    private _meow: any = null;

    constructor( private _cli: CLI ) {
    }

    async updateOptions( options: Options ): Promise< void > {

        // CLI options are read firstly in order to eventually consider
        // some parameter before loading a configuration file, i.e., pass
        // some argument to `optionsFromConfigFile`.

        const cliOptions = this.optionsFromCLI();

        const cfgFileOptions = await this.optionsFromConfigFile(); // may be null

        const finalObj = Object.assign( cfgFileOptions || {}, cliOptions );

        options.fromObject( finalObj );
    }

    showHelp(): void {
        this._cli.newLine( this._meow.help );
    }

    showAbout(): void {
        const m = this._meow;

        const desc = m.pkg.description || 'Concordia';
        const version = m.pkg.version || '1.0.0';
        const name = m.pkg.author.name || 'Thiago Delgado Pinto';
        const site = m.pkg.homepage || 'https://concordialang.org';

        this._cli.newLine( desc + ' v' + version  );
        this._cli.newLine( 'Copyright (c) ' + name );
        this._cli.newLine( site );
    }

    showVersion(): void {
        this._meow.showVersion();
    }

    private optionsFromCLI(): any {
        const cliHelp: CliHelp = new CliHelp();
        this._meow = meow( cliHelp.content(), cliHelp.meowOptions() );
        // this._meowInput = meow( this._cliHelp.content(), this._cliHelp.meowNewOptions() );
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

   private async optionsFromConfigFile(): Promise< any | null > {
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
        let configObj = null;
        if ( isDefined( fileConfig ) ) {
            configObj = fileConfig.config;
            const cfgFilePath = relative( process.cwd(), fileConfig.filepath );
            this._cli.newLine(
                this._cli.symbolInfo,
                'Configuration file loaded:',
                this._cli.colorHighlight( cfgFilePath )
            );
        }
        return configObj;
   }


}