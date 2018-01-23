import { Options } from "./Options";
import { LanguageDrawer } from "./LanguageDrawer";
import { LanguageManager } from "./LanguageManager";
import { CLI } from "./CLI";

export class LanguageController {

    constructor( private _cli: CLI ) {        
    }    

    public process = async ( options: Options ): Promise< void > => {

        if ( options.languageList ) {
            const languages: string[] = await ( new LanguageManager() ).availableLanguages();
            ( new LanguageDrawer( this._cli ) ).drawLanguages( languages );
        }

    };

}