import Graph = require( 'graph.js/dist/graph.full.js' );

import { CompilerListener } from './CompilerListener';
import { TestCaseGeneratorListener } from '../testcase/TestCaseGeneratorListener';
import { Options } from "../app/Options";
import { TestCaseGeneratorFacade } from "../testcase/TestCaseGeneratorFacade";
import { RuntimeException } from '../error';
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
        private readonly _tcGenListener: TestCaseGeneratorListener,
        ) {
    }

    public async compile( options: Options ): Promise< [ AugmentedSpec, Graph ] > {

        const startTime = Date.now();

        const fileSearcher = new FSFileSearcher( this._fs );

        if ( this._compilerListener ) {
            this._compilerListener.announceFileSearchStarted();
        }

        const files: string[] = await fileSearcher.searchFrom( options );
        // console.log( '>>> FOUND', files );

        if ( this._compilerListener ) {
            const durationMS = Date.now() - startTime;
            this._compilerListener.announceFileSearchFinished( durationMS, files );
        }

        if ( files.length < 1 ) {
            return [ null, null ];
        }

        const lm = new LanguageManager( fileSearcher, options.languageDir );
        const availableLanguages: string[] = await lm.availableLanguages();
        if ( availableLanguages.indexOf( options.language ) < 0 ) { // not found
            throw new RuntimeException( 'Informed language is not available: ' + options.language );
        }


        const fileHandler = new FSFileHandler( this._fs );
        const langLoader: LanguageContentLoader = new JsonLanguageContentLoader(
            options.languageDir, {}, fileHandler, fileHandler );
        const lexer: Lexer = new Lexer( options.language, langLoader );
        const parser: Parser = new Parser();
        const nlpTrainer: NLPTrainer = new NLPTrainer( langLoader );
        const nlpBasedSentenceRecognizer: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( nlpTrainer );

        const singleFileCompiler = new SingleFileCompiler(
            lexer,
            parser,
            nlpBasedSentenceRecognizer,
            options.language
        );

        if ( this._compilerListener ) {
            this._compilerListener.announceCompilerStarted( options );
        }

        const compiler = new Compiler( fileHandler, singleFileCompiler, options.lineBreaker );

        // console.log( 'IN >', files.length, "\n", files );

        const output = await compiler.compile( files, options.directory, { stopOnTheFirstError: options.stopOnTheFirstError } );

        // console.log( 'OUT >', output.spec.docs.length, "\n", output.spec.docs.map( d => d.fileInfo.path ) );

        const compiledFilesCount = output.spec?.docs?.length;
        if ( this._compilerListener && compiledFilesCount ) {
            const durationMS = Date.now() - startTime;

            const testCasesCount = output.spec?.docs?.filter(
                doc => doc.fileInfo?.path?.endsWith( options.extensionTestCase ) ).length;

            const featuresCount = compiledFilesCount - testCasesCount;

            this._compilerListener.announceCompilerFinished(
                compiledFilesCount, featuresCount, testCasesCount, durationMS );

            this._compilerListener.reportProblems( output.problems, options.directory );
        }

        if ( ! options.generateTestCase || ! output.spec.docs || compiledFilesCount < 1 ) {
            return [ output.spec, output.graph ];
        }

        const tcGenCtrl = new TestCaseGeneratorFacade(
            nlpBasedSentenceRecognizer.variantSentenceRec,
            langLoader,
            this._tcGenListener,
            fileHandler
            );

        return await tcGenCtrl.execute( options, output.spec, output.graph );
    }

}