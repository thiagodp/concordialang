import Graph = require( 'graph.js/dist/graph.full.js' );

import { DateTimeFormatter, LocalDateTime } from '@js-joda/core';
import { createHash } from 'crypto';
import { Options } from "../app/Options";
import { RuntimeException } from '../error';
import { JsonLanguageContentLoader, LanguageContentLoader } from "../language";
import { LanguageManager } from "../language/LanguageManager";
import { Lexer } from "../lexer/Lexer";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { NLPTrainer } from "../nlp/NLPTrainer";
import { Parser } from "../parser/Parser";
import { AugmentedSpec } from "../req/AugmentedSpec";
import { TestCaseGeneratorFacade } from "../testcase/TestCaseGeneratorFacade";
import { TestCaseGeneratorListener } from '../testcase/TestCaseGeneratorListener';
import { toUnixPath, FileSearchResults } from '../util/file';
import { changeFileExtension } from '../util/file/ext-changer';
import { FSFileHandler } from '../util/file/FSFileHandler';
import { FSFileSearcher } from '../util/file/FSFileSearcher';
import { Compiler } from './Compiler';
import { CompilerListener } from './CompilerListener';
import { SingleFileCompiler } from "./SingleFileCompiler";


export function filterFilesToCompile(
    files: string[],
    extensionFeature: string,
    extensionTestCase: string,
    pathLibrary: any
) {
    const featureFiles: string[] = files
        .filter( f => f.endsWith( extensionFeature ) )
        .map( f => toUnixPath( f ) );

    const onlyTestCases: string[] = files
        .filter( f => f.endsWith( extensionTestCase ) )
        .map( f => toUnixPath( f ) );

    const testCasesWithoutFeature: string[] = onlyTestCases
        .filter( tc => ! featureFiles.includes(
            toUnixPath( changeFileExtension( tc, extensionFeature, pathLibrary ) ) )
            );

    return featureFiles.concat( testCasesWithoutFeature );
}

/**
 * Compiler facade
 *
 * @author Thiago Delgado Pinto
 */
export class CompilerFacade {

    constructor(
        private readonly _fs: any,
        private readonly _path: any,
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

		const searchResults: FileSearchResults = await fileSearcher.searchFrom( options );

		if ( this._compilerListener && searchResults.warnings.length > 0 ) {
			this._compilerListener.announceFileSearchWarnings( searchResults.warnings );
		}

        const files: string[] = searchResults.files;
		// console.log( '>>> FOUND', files );

        const filesToCompile: string[] = filterFilesToCompile(
            files, options.extensionFeature, options.extensionTestCase, this._path );

        const filesToCompileCount = filesToCompile.length;

        if ( this._compilerListener ) {
            const filesCount = files.length;
            const ignoredCount = files.length - filesToCompileCount;
            const durationMS = Date.now() - startTime;
            this._compilerListener.announceFileSearchFinished( durationMS, filesCount, ignoredCount );
        }

        if ( filesToCompileCount < 1 ) {
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

        const output = await compiler.compile( filesToCompile, options.directory, { stopOnTheFirstError: options.stopOnTheFirstError } );

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

        this.updateSeed( options, this._compilerListener );

        const tcGen = new TestCaseGeneratorFacade(
            nlpBasedSentenceRecognizer.variantSentenceRec,
            langLoader,
            this._tcGenListener,
            fileHandler
            );

        return await tcGen.execute( options, output.spec, output.graph );
    }


    private updateSeed( options: Options, ui: CompilerListener ): void {

        if ( ! options.seed ) {
            options.isGeneratedSeed = true;
            options.seed = LocalDateTime.now().format(
                DateTimeFormatter.ofPattern( 'yyyy-MM-dd HH:mm:ss' )
                ).toString();
        }

        // const isOptionThatIgnoresSeed =
        //     options.help
        //     || options.about
        //     || options.version
        //     || options.newer
        //     || options.languageList
        //     || options.pluginList
        //     || options.init
        //     || options.ast
        //     || options.somePluginOption();

        // if ( ! isOptionThatIgnoresSeed ) {
        //     ui.announceSeed( options.seed, options.isGeneratedSeed );
        // }

        ui.announceSeed( options.seed, options.isGeneratedSeed );

        // Real seed
        const BYTES_OF_SHA_512 = 64; // 512 divided by 8
        if ( options.seed.length < BYTES_OF_SHA_512 ) {

            options.realSeed = createHash( 'sha512' )
                .update( options.seed )
                .digest( 'hex' );

        } else {
            options.realSeed = options.seed;
        }

        ui.announceRealSeed( options.realSeed );
    }

}
