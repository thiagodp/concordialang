import { Options } from "./Options";
import { LanguageDrawer } from "./LanguageDrawer";
import { LanguageManager } from "./LanguageManager";
import { CLI } from "./CLI";

export class LanguageController {

    constructor( private _cli: CLI ) {        
    }    

    public process = async ( options: Options ): Promise< void > => {

        if ( options.languageList ) {
            const lm = new LanguageManager( options.languageDir );
            const languages: string[] = await lm.availableLanguages();
            const ld = new LanguageDrawer( this._cli );
            ld.drawLanguages( languages );
        }

    };

}