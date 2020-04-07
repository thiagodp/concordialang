import Graph = require( 'graph.js/dist/graph.full.js' );

import { Compiler as Compiler2 } from "../compiler/Compiler2";
import { FileCompiler } from '../compiler/FileCompiler';
import { MultiFileProcessor as MultiFileProcessor2 } from "../compiler/MultiFileProcessor2";
import { JsonLanguageContentLoader, LanguageContentLoader } from "../dict";
import { Lexer } from "../lexer/Lexer";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { NLPTrainer } from "../nlp/NLPTrainer";
import { Parser } from "../parser/Parser";
import { AugmentedSpec } from "../req/AugmentedSpec";
import { BatchSpecificationAnalyzer } from "../semantic/BatchSpecificationAnalyzer";
import { FSFileHandler } from '../util/file/FSFileHandler';
import { FSFileSearcher } from '../util/file/FSFileSearcher';
import { CLI } from "./CLI";
import { LanguageManager } from "./LanguageManager";
import { Options } from "./Options";
import { SimpleAppEventsListener } from "./SimpleAppEventsListener";
import { SingleFileCompiler } from "./SingleFileCompiler";
import { TCGenController } from "./TCGenController";
import { VerboseAppEventsListener } from "./VerboseAppEventsListener";

/**
 * Compiler controller
 *
 * @author Thiago Delgado Pinto
 */
export class CompilerController {

    constructor( private _fs: any ) {
    }

    public async compile( options: Options, cli: CLI ): Promise< [ AugmentedSpec, Graph ] > {

        const fileHandler = new FSFileHandler( this._fs );
        const fileSearcher = new FSFileSearcher( this._fs );

        const langLoader: LanguageContentLoader =
            new JsonLanguageContentLoader( options.languageDir, {}, fileHandler, fileHandler );

        let lexer: Lexer = new Lexer( options.language, langLoader );
        let parser: Parser = new Parser();

        let nlpTrainer: NLPTrainer = new NLPTrainer( langLoader );
        let nlpBasedSentenceRecognizer: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

        let specAnalyzer: BatchSpecificationAnalyzer = new BatchSpecificationAnalyzer();

        const lm = new LanguageManager( fileSearcher, options.languageDir );
        const availableLanguages: string[] = await lm.availableLanguages();
        if ( availableLanguages.indexOf( options.language ) < 0 ) { // not found
            throw new Error( 'Informed language is not available: ' + options.language );
        }

        // Verbose output option
        let listener =  options.verbose
            ? new VerboseAppEventsListener( cli, options.debug )
            : new SimpleAppEventsListener( cli, options.debug );

        let singleFileCompiler = new SingleFileCompiler(
            lexer,
            parser,
            nlpBasedSentenceRecognizer,
            options.language
        );

        // let mfp = new MultiFileProcessor( singleFileCompiler, listener, listener, listener, listener );

        // let compiler = new Compiler(
        //     mfp,
        //     specAnalyzer
        // );

        const fileCompiler = new FileCompiler( fileHandler, singleFileCompiler, options.lineBreaker );
        const mfp = new MultiFileProcessor2( fileCompiler );

        const compiler = new Compiler2( fileSearcher, mfp, specAnalyzer );

        let [ spec, graph ] = await compiler.compile( options, listener );

        if ( ! options.generateTestCase || ! spec.docs || spec.docs.length < 1 ) {
            return [ spec, graph ];
        }

        const tcGenCtrl = new TCGenController(
            nlpBasedSentenceRecognizer.variantSentenceRec,
            langLoader,
            listener,
            fileHandler
            );

        return await tcGenCtrl.execute( options, spec, graph );
    }

}