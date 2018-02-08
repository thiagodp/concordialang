import { CLI } from "./CLI";
import { CliHelp } from "./CliHelp";
import { Options } from "./Options";
import * as meow from 'meow';

export class UI {

    private _cliHelp: CliHelp = new CliHelp();
    private _meowInput: any = null;
    private _options: Options = new Options();

    constructor( private _cli: CLI ) {
    }

    updateOptions( options: Options ): void {
        this._meowInput = meow( this._cliHelp.content(), this._cliHelp.meowOptions() ); 
        options.fromMeow( this._meowInput );
    }

    showHelp(): void {
        this._cli.newLine( this._meowInput.help );
    }

    showAbout(): void {
        const m = this._meowInput;

        const desc = m.pkg.description || 'Concordia';
        const version = m.pkg.version || '1.0.0';
        const name = m.pkg.author.name || 'Thiago Delgado Pinto';
        const site = m.pkg.homepage || 'https://concordialang.org';

        this._cli.newLine( desc + ' v' + version  );
        this._cli.newLine( 'Copyright (c) 2017 ' + name );
        this._cli.newLine( site );
    }

    showVersion(): void {
        this._meowInput.showVersion();
    }

}