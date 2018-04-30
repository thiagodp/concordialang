import { CLI } from "./CLI";
import { CliHelp } from "./CliHelp";
import { Options } from "./Options";
import * as meow from 'meow';
import * as cosmiconfig from 'cosmiconfig';
import { isDefined } from "../util/TypeChecking";
import { relative } from "path";

export class UI {

    constructor( private _cli: CLI, private _meow: any ) {
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

}