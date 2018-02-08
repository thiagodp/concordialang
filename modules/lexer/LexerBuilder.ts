import { Lexer } from "./Lexer";
import { LanguageContentLoader, JsonLanguageContentLoader } from "../dict/LanguageContentLoader";
import { Options } from "../app/Options";
import { EnglishKeywordDictionary } from "../dict/EnglishKeywordDictionary";

export class LexerBuilder {

    constructor( private _langLoader: LanguageContentLoader = null ) {
    }

    build( options: Options, language: string = 'en' ): Lexer {

        let langLoader: LanguageContentLoader = this._langLoader;
        if ( ! langLoader ) {
            langLoader = new JsonLanguageContentLoader( options.languageDir, {}, options.encoding );
        }

        // Loads the english language content
        let englishContent = langLoader.load( 'en' ); // may throw

        // If keywords are not defined, use the default dictionary
        if ( englishContent && ! englishContent.keywords ) {
            englishContent.keywords = new EnglishKeywordDictionary();   
        }

        return new Lexer( language, langLoader );        
    }
}