import Graph = require( 'graph.js/dist/graph.full.js' );

import { SimpleAppEventsListener } from "./SimpleAppEventsListener";
import { AugmentedSpec } from "../req/AugmentedSpec";
import { Lexer } from "../lexer/Lexer";
import { LexerBuilder } from "../lexer/LexerBuilder";
import { Parser } from "../parser/Parser";
import { NLPTrainer } from "../nlp/NLPTrainer";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { BatchSpecificationAnalyzer } from "../semantic/BatchSpecificationAnalyzer";
import { LanguageContentLoader, JsonLanguageContentLoader } from "../dict";
import { Options } from "./Options";
import { CLI } from "./CLI";
import { SingleFileCompiler } from "./SingleFileCompiler";
import { MultiFileProcessor } from "./MultiFileProcessor";
import { VerboseAppEventsListener } from "./VerboseAppEventsListener";
import { Compiler } from "./Compiler";
import { MultiFileProcessor as MultiFileProcessor2 } from "../compiler/MultiFileProcessor2";
import { Compiler as Compiler2 } from "../compiler/Compiler2";
import { LanguageManager } from "./LanguageManager";
import { TCGenController } from "./TCGenController";
import { FSFileReader } from '../compiler/FSFileReader';
import { GlobFileSearcher } from '../util/file-search';
import { FileCompiler } from '../compiler/FileCompiler';

/**
 * Compiler controller
 *
 * @author Thiago Delgado Pinto
 */
export class CompilerController {

    constructor( private _fs: any ) {
    }

    public async compile( options: Options, cli: CLI ): Promise< [ AugmentedSpec, Graph ] > {

        const langLoader: LanguageContentLoader =
            new JsonLanguageContentLoader( options.languageDir, {}, options.encoding );

        let lexer: Lexer = ( new LexerBuilder( langLoader ) ).build( options, options.language );
        let parser: Parser = new Parser();

        let nlpTrainer: NLPTrainer = new NLPTrainer( langLoader );
        let nlpBasedSentenceRecognizer: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

        let specAnalyzer: BatchSpecificationAnalyzer = new BatchSpecificationAnalyzer();

        const lm = new LanguageManager( options.languageDir );
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

        const fileReader = new FSFileReader( this._fs );
        const fileCompiler = new FileCompiler( fileReader, singleFileCompiler, options.lineBreaker );
        const mfp = new MultiFileProcessor2( fileCompiler );
        const fileSearcher = new GlobFileSearcher( this._fs );
        const compiler = new Compiler2( fileSearcher, mfp, specAnalyzer );

        let [ spec, graph ] = await compiler.compile( options, listener );

        if ( ! options.generateTestCase || ! spec.docs || spec.docs.length < 1 ) {
            return [ spec, graph ];
        }

        const tcGenCtrl = new TCGenController( listener );

        return await tcGenCtrl.execute(
            nlpBasedSentenceRecognizer.variantSentenceRec,
            langLoader,
            options,
            spec,
            graph
        );
    }

}