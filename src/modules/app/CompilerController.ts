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

    public compile = async ( options: Options, cli: CLI ): Promise< Spec > => {

        let dictMap = { 'en': new EnglishKeywordDictionary() };

        let dictLoader: KeywordDictionaryLoader =
            new JsonKeywordDictionaryLoader( options.languageDir, dictMap, options.encoding );

        let lexer: Lexer = new Lexer( 'en', dictLoader );

        let parser: Parser = new Parser();

        let nlpTrainer: NLPTrainer = new NLPTrainer( options.nlpDir, options.trainingDir );
        let nlpBasedSentenceRecognizer: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

        let specAnalyzer: SpecAnalyzer = new SpecAnalyzer();
        
        const lm = new LanguageManager( options.languageDir );
        const availableLanguages: string[] = await lm.availableLanguages();
        if ( availableLanguages.indexOf( options.language ) < 0 ) { // not found
            throw new Error( 'Informed language is not available: ' + options.language );
        }

        // Verbose output option
        let listener =  options.verbose
            ? new VerboseAppEventsListener( cli )
            : new SimpleAppEventsListener( cli );

        let singleFileCompiler = new SingleFileCompiler(
            lexer,
            parser,
            nlpBasedSentenceRecognizer,
            options.language
        );

        let mfp = new MultiFileProcessor( singleFileCompiler, listener, listener, listener, listener );        

        let compiler = new Compiler(
            mfp,
            specAnalyzer
        );

        return await compiler.compile( options, listener );
    };

}