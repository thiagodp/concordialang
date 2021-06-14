import { DateTimeFormatter, LocalDateTime } from '@js-joda/core';
import { createHash } from 'crypto';
import Graph from 'graph.js/dist/graph.full.js';

import { AppOptions } from '../app/app-options';
import { RuntimeException } from '../error';
import languageMap, { availableLanguages } from '../language/data/map';
import { Lexer } from '../lexer/Lexer';
import { NLPBasedSentenceRecognizer } from '../nlp/NLPBasedSentenceRecognizer';
import { NLPTrainer } from '../nlp/NLPTrainer';
import { Parser } from '../parser/Parser';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { TestCaseGeneratorFacade } from '../testcase/TestCaseGeneratorFacade';
import { TestCaseGeneratorListener } from '../testcase/TestCaseGeneratorListener';
import { FileSearchResults, toUnixPath } from '../util/file';
import { changeFileExtension } from '../util/fs/ext-changer';
import { FSFileHandler } from '../util/fs/FSFileHandler';
import { FSFileSearcher } from '../util/fs/FSFileSearcher';
import { Compiler } from './Compiler';
import { CompilerListener } from './CompilerListener';
import { SingleFileCompiler } from './SingleFileCompiler';


export function filterFilesToCompile(
    files: string[],
    extensionFeature: string,
    extensionTestCase: string
) {
    const featureFiles: string[] = files
        .filter( f => f.endsWith( extensionFeature ) )
        .map( f => toUnixPath( f ) );

    const onlyTestCases: string[] = files
        .filter( f => f.endsWith( extensionTestCase ) )
        .map( f => toUnixPath( f ) );

    const testCasesWithoutFeature: string[] = onlyTestCases
        .filter( tc => ! featureFiles.includes(
            toUnixPath( changeFileExtension( tc, extensionFeature ) ) )
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
        private readonly _promisify: any,
        private readonly _compilerListener: CompilerListener,
        private readonly _tcGenListener: TestCaseGeneratorListener,
        ) {
    }

    public async compile( options: AppOptions ): Promise< [ AugmentedSpec, Graph ] > {

        const startTime = Date.now();

        const fileSearcher = new FSFileSearcher( this._fs );

        if ( this._compilerListener ) {
            this._compilerListener.announceFileSearchStarted();
		}

		const searchResults: FileSearchResults = await fileSearcher.searchFrom( {
			directory: options.directory,
			extensions: [ options.extensionFeature, options.extensionTestCase ],
			file: options.file,
			ignore: options.ignore,
			recursive: options.recursive
		} );

		if ( this._compilerListener && searchResults.warnings.length > 0 ) {
			this._compilerListener.announceFileSearchWarnings( searchResults.warnings );
		}

        const files: string[] = searchResults.files;
		// console.log( '>>> FOUND', files );

		// If the options is just to generate script, ALL the .testcase files should be considered.
		const isJustGenerateScript: boolean = options.script &&
			! options.run && ! options.result;

		const filesToCompile: string[] = isJustGenerateScript ? files :
			filterFilesToCompile( files, options.extensionFeature, options.extensionTestCase );

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

        if ( availableLanguages.indexOf( options.language ) < 0 ) { // not found
            throw new RuntimeException( 'Informed language is not available: ' + options.language );
        }


        const fileHandler = new FSFileHandler( this._fs, this._promisify, options.encoding );

        const lexer: Lexer = new Lexer( options.language, languageMap );
        const parser: Parser = new Parser();
        const nlpTrainer: NLPTrainer = new NLPTrainer( languageMap );
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

        if ( ! options.testCase || ! output.spec.docs || compiledFilesCount < 1 ) {
            return [ output.spec, output.graph ];
        }

        this.updateSeed( options, this._compilerListener );

        const tcGen = new TestCaseGeneratorFacade(
            nlpBasedSentenceRecognizer.variantSentenceRec,
            languageMap,
            this._tcGenListener,
            fileHandler
            );

        return await tcGen.execute( options, output.spec, output.graph );
    }


    private updateSeed( options: AppOptions, ui: CompilerListener ): void {

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
