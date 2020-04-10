import { CLI } from "./CLI";

export class LanguageDrawer {

    constructor( private _cli: CLI ) {
    }

    public drawLanguages = ( languages: string[]  ): void => {
        const highlight = this._cli.colorHighlight;
        this._cli.newLine(
            this._cli.symbolInfo,
            'Available languages:',
            languages.sort().map( l => highlight( l ) ).join( ', ' )
        );
    };
}