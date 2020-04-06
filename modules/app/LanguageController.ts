import { FileSearcher } from '../util/file/FileSearcher';
import { CLI } from "./CLI";
import { LanguageDrawer } from "./LanguageDrawer";
import { LanguageManager } from "./LanguageManager";
import { Options } from "./Options";

export class LanguageController {

    constructor(
        private readonly _cli: CLI,
        private readonly _fileSearcher: FileSearcher,
        ) {
    }

    public async process( options: Options ): Promise< void > {

        if ( options.languageList ) {
            const lm = new LanguageManager( this._fileSearcher, options.languageDir );
            const languages: string[] = await lm.availableLanguages();
            const ld = new LanguageDrawer( this._cli );
            ld.drawLanguages( languages );
        }

    }

}