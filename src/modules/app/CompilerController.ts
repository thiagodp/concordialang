import { Options } from "./Options";
import { CLI } from "./CLI";
import { SingleFileCompiler } from "./SingleFileCompiler";
import { MultiFileProcessor, MultiFileProcessedData } from "./MultiFileProcessor";
import { VerboseAppEventsListener } from "./VerboseAppEventsListener";
import { SimpleAppEventsListener } from "./SimpleAppEventsListener";
import { Spec } from "../ast/Spec";
import { Lexer } from "../lexer/Lexer";
import { LocatedException } from "../req/LocatedException";
import { EnglishKeywordDictionary } from "../dict/EnglishKeywordDictionary";
import { KeywordDictionaryLoader } from "../dict/KeywordDictionaryLoader";
import { JsonKeywordDictionaryLoader } from "../dict/JsonKeywordDictionaryLoader";
import { Parser } from "../parser/Parser";
import { NLPTrainer } from "../nlp/NLPTrainer";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { SpecAnalyzer } from "../semantic/SpecAnalyzer";
import { Compiler } from "./Compiler";
import { LanguageManager } from "./LanguageManager";


export class CompilerController {

    private _dictMap = { 'en': new EnglishKeywordDictionary() };
    private _dictLoader: KeywordDictionaryLoader =
        new JsonKeywordDictionaryLoader( this._dictMap );
    private _lexer: Lexer = new Lexer( 'en', this._dictLoader );

    private _parser: Parser = new Parser();

    private _nlpTrainer: NLPTrainer = new NLPTrainer();
    private _nlpBasedSentenceRecognizer: NLPBasedSentenceRecognizer =
        new NLPBasedSentenceRecognizer();

    private _specAnalyzer: SpecAnalyzer = new SpecAnalyzer();        


    constructor() {
    }
    

    public compile = async ( options: Options, cli: CLI ): Promise< Spec > => {

        const availableLanguages: string[] = await ( new LanguageManager() ).availableLanguages();
        if ( availableLanguages.indexOf( options.language ) < 0 ) { // not found
            throw new Error( 'Informed language is not available: ' + options.language );
        }

        let listener =  options.verbose
            ? new VerboseAppEventsListener( cli )
            : new SimpleAppEventsListener( cli );

        let singleFileCompiler = new SingleFileCompiler(
            this._lexer,
            this._parser,
            this._nlpBasedSentenceRecognizer,
            options.language
        );

        let mfp = new MultiFileProcessor( singleFileCompiler, listener, listener, listener, listener );        

        let compiler = new Compiler(
            mfp,
            this._specAnalyzer
        );

        return await compiler.compile( options, listener );
    };

}