import Graph = require( 'graph.js/dist/graph.full.js' );

import { CompilerListener } from 'modules/app/listeners/CompilerListener';
import { TCGenListener } from 'modules/app/listeners/TCGenListener';
import { Options } from "../app/Options";
import { TCGenController } from "../app/TCGenController";
import { JsonLanguageContentLoader, LanguageContentLoader } from "../language";
import { LanguageManager } from "../language/LanguageManager";
import { Lexer } from "../lexer/Lexer";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { NLPTrainer } from "../nlp/NLPTrainer";
import { Parser } from "../parser/Parser";
import { AugmentedSpec } from "../req/AugmentedSpec";
import { FSFileHandler } from '../util/file/FSFileHandler';
import { FSFileSearcher } from '../util/file/FSFileSearcher';
import { Compiler } from './Compiler';
import { SingleFileCompiler } from "./SingleFileCompiler";

/**
 * Compiler facade
 *
 * @author Thiago Delgado Pinto
 */
export class CompilerFacade {

    constructor(
        private readonly _fs: any,
        private readonly _compilerListener: CompilerListener,
        private readonly _tcGenListener: TCGenListener,
        ) {
    }

    public async compile( options: Options ): Promise< [ AugmentedSpec, Graph ] > {

        const startTime = Date.now();

        const fileHandler = new FSFileHandler( this._fs );
        const fileSearcher = new FSFileSearcher( this._fs );

        const langLoader: LanguageContentLoader =
            new JsonLanguageContentLoader( options.languageDir, {}, fileHandler, fileHandler );

        let lexer: Lexer = new Lexer( options.language, langLoader );
        let parser: Parser = new Parser();

        let nlpTrainer: NLPTrainer = new NLPTrainer( langLoader );
        let nlpBasedSentenceRecognizer: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

        const lm = new LanguageManager( fileSearcher, options.languageDir );
        const availableLanguages: string[] = await lm.availableLanguages();
        if ( availableLanguages.indexOf( options.language ) < 0 ) { // not found
            throw new Error( 'Informed language is not available: ' + options.language );
        }

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

        const files: string[] = await fileSearcher.searchFrom( options );

        if ( this._compilerListener ) {
            this._compilerListener.compilerStarted( options );
        }

        const compiler = new Compiler( fileHandler, singleFileCompiler, options.lineBreaker );

        // console.log( 'IN >', files.length, "\n", files );

        const output = await compiler.compile( files, options.directory, { stopOnTheFirstError: options.stopOnTheFirstError } );

        // console.log( 'OUT >', output.spec.docs.length, "\n", output.spec.docs.map( d => d.fileInfo.path ) );

        if ( this._compilerListener ) {
            // const durationMS = Date.now() - startTime;
            // this._compilerListener.compilationFinished(
            //     files.length, output.spec?.docs?.length || files.length, durationMS );
            this._compilerListener.reportProblems( output.problems, options.directory );
        }

        if ( ! options.generateTestCase || ! output.spec.docs || output.spec.docs.length < 1 ) {
            return [ output.spec, output.graph ];
        }

        const tcGenCtrl = new TCGenController(
            nlpBasedSentenceRecognizer.variantSentenceRec,
            langLoader,
            this._tcGenListener,
            fileHandler
            );

        return await tcGenCtrl.execute( options, output.spec, output.graph );
    }

}