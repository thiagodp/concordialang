import {
    AbstractTestScript,
    Plugin,
    TestScriptExecutionOptions,
    TestScriptGenerationOptions,
    TestScriptGenerationResult,
} from 'concordialang-plugin';
import { TestScriptExecutionResult } from 'concordialang-types';

import { Document, Spec } from '../ast';
import { CompilerFacade } from '../compiler/CompilerFacade';
import { PackageBasedPluginFinder } from '../plugin/PackageBasedPluginFinder';
import { PluginData } from '../plugin/PluginData';
import { PluginManager } from '../plugin/PluginManager';
import { FileBasedTestReporterOptions } from '../report/FileBasedTestReporter';
import { JSONTestReporter } from '../report/JSONTestReporter';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { AbstractTestScriptGenerator } from '../testscript/AbstractTestScriptGenerator';
import { TestResultAnalyzer } from '../testscript/TestResultAnalyzer';
import { DirSearcher } from '../util/file';
import { FSDirSearcher, FSFileHandler } from '../util/fs';
import { AppOptions, hasSomeOptionThatRequiresAPlugin } from './app-options';
import { AppListener } from './app-listener';

type AppResult = {
	spec?: Spec,
	success: boolean,
};


/**
 * Application facade
 *
 * @author Thiago Delgado Pinto
 */
export class App {

    constructor(
        private _fs: any,
        private _path: any,
        private _promisify: any
    ) {
    }

    async start( options: AppOptions, listener: AppListener ): Promise< AppResult > {

        const fs = this._fs;
        const path = this._path;
        const promisify = this._promisify;

        const fileHandler = new FSFileHandler( fs, promisify, options.encoding );

		// Load plug-in

		let plugin: Plugin = null;

		if ( hasSomeOptionThatRequiresAPlugin( options ) && options.plugin ) {

			const dirSearcher: DirSearcher = new FSDirSearcher( fs, promisify );

			const pluginManager: PluginManager = new PluginManager(
                options.packageManager,
				listener,
				new PackageBasedPluginFinder( options.processPath, fileHandler, dirSearcher ),
				fileHandler
				);

			let pluginData: PluginData = null;
            try {
                pluginData = await pluginManager.pluginWithName( options.plugin );
                if ( ! pluginData ) {
                    listener.announcePluginNotFound( options.plugin );
                    return { success: false };;
                }
                plugin = await pluginManager.load( pluginData );
            } catch ( err ) {
                listener.showException( err );
                return { success: false };
            }
            if ( ! plugin ) { // needed?
                listener.announcePluginCouldNotBeLoaded( options.plugin );
                return { success: false };;
            }

            // can continue
		}

		if ( ! plugin &&
			( options.script || options.run || options.result )
		) {
            listener.announceNoPluginWasDefined();
            return { success: false };;
		}

		// Compile

        let hasErrors: boolean = false;
        let spec: AugmentedSpec = null;

        listener.announceOptions( options );

        if ( options.spec ) {
            const compiler = new CompilerFacade( fs, path, promisify, listener, listener );
            try {
				[ spec, /* graph */ ] = await compiler.compile( options );
            } catch ( err ) {
                hasErrors = true;
                listener.showException( err );
			}

			if ( null === spec && options.file.length > 0 ) {
				return { success: ! hasErrors };
			}
		}

        // Abstract test scripts

        let abstractTestScripts: AbstractTestScript[] = [];
        let generatedTestScriptFiles: string[] = [];

        if ( spec && options.script ) { // Requires spec and a plugin

            let docs: Document[] = spec.docs;

            // console.log( '>> spec docs', spec.docs.map( d => d.fileInfo.path ) );

            // if ( options.files && options.files.length > 0 ) {

            //     const endsWithFeatureExtension = new RegExp( `/\\${options.extensionFeature}$/`, 'u' );

            //     const transformFeaturesFilesIntoTestCaseFiles = Array.from( new Set(
            //         options.files.map( f => toUnixPath( f.replace( endsWithFeatureExtension, options.extensionTestCase ) ) )
            //         ) );

            //     console.log( '>> FILTER >>', transformFeaturesFilesIntoTestCaseFiles );

            //     const docContainsPath = ( doc: Document, path: string ): boolean => {
            //         // console.log( 'DOC', toUnixPath( doc.fileInfo.path ), 'PATH', toUnixPath( path ) );
            //         return toUnixPath( doc.fileInfo.path ).endsWith( toUnixPath( path ) );
            //     };

            //     docs = spec.docs.filter( doc => transformFeaturesFilesIntoTestCaseFiles.findIndex( file => docContainsPath( doc, file ) ) >= 0 );

            //     console.log( '>> docs after filter >>', spec.docs.map( d => d.fileInfo.path ) );
            // }

            const atsGenerator = new AbstractTestScriptGenerator();
            abstractTestScripts = atsGenerator.generate( docs, spec );

            if ( abstractTestScripts && abstractTestScripts.length > 0 ) {

                const startTime = Date.now();

                // cli.newLine( cli.symbolInfo, 'Generated', abstractTestScripts.length, 'abstract test scripts' );
                let errors: Error[] = [];
                try {
                    const r: TestScriptGenerationResult = await plugin.generateCode(
                        abstractTestScripts,
                        new TestScriptGenerationOptions(
                            options.plugin,
                            options.dirScript,
                            options.directory
                        )
                    );
                    generatedTestScriptFiles = r?.generatedFiles || [];
                    errors = r?.errors || [];
                } catch ( err ) {
                    hasErrors = true;
                    listener.showException( err );
                }

                const durationMS = Date.now() - startTime;

                listener.showGeneratedTestScriptFiles(
                    options.dirScript,
                    generatedTestScriptFiles,
                    durationMS
                );

                listener.showTestScriptGenerationErrors( errors );
            }
        }

        let executionResult: TestScriptExecutionResult = null;

        const shouldExecuteScripts: boolean =  !! plugin &&
            ( options.run &&
                ( options.scriptFile?.length > 0 ||
                    generatedTestScriptFiles.length > 0 ||
					( 'string' === typeof options.dirResult && options.dirResult != '' ) ) );

        if ( shouldExecuteScripts ) { // Execution requires a plugin, but NOT a spec

            // console.log( '>>>', 'generatedTestScriptFiles', generatedTestScriptFiles );

            const scriptFiles = options.scriptFile?.length > 0
                ? options.scriptFile.join( ',' )
                : generatedTestScriptFiles.length > 0
                    ? generatedTestScriptFiles.join( ',' )
                    : undefined;

            const tseo: TestScriptExecutionOptions = {
                dirScript: options.dirScript,
                dirResult: options.dirResult,
                file: scriptFiles || undefined,
                grep: options.scriptGrep || undefined,
                target: options.target || undefined,
                headless: options.headless || undefined,
                instances: options.instances || undefined,
                // parameters: options.pluginOption || undefined,
            } as TestScriptExecutionOptions;

            listener.announceTestScriptExecutionStarted();

            try {
                executionResult = await plugin.executeCode( tseo );
            } catch ( err ) {
                hasErrors = true;
                listener.announceTestScriptExecutionError( err );
            }

            listener.announceTestScriptExecutionFinished();
        }

        if ( ! hasErrors && ( executionResult?.total?.failed > 0 || executionResult?.total?.error > 0 ) ) {
            hasErrors = true;
		}

		if ( options.result ) { // Requires a plugin

			let reportFile: string;

            if ( ! executionResult ) {

                const defaultReportFile: string = path.join(
					options.dirResult,
					await plugin.defaultReportFile()
				);

                if ( ! fs.existsSync( defaultReportFile ) ) {
                    listener.announceReportFileNotFound( defaultReportFile );
                    return { success: false, spec };
                }

                reportFile = defaultReportFile;
            } else {
                reportFile = executionResult.sourceFile;
			}

            if ( reportFile ) {

                listener.announceReportFile( reportFile );
                try {
                    executionResult = await plugin.convertReportFile( reportFile );
                } catch ( err ) {
                    hasErrors = true;
                    listener.showException( err );
                }
            }

		}


		if ( executionResult ) {
			try {
				const reportedResult = ( new TestResultAnalyzer() ).adjustResult(
					executionResult,
					abstractTestScripts
				);

				listener.showTestScriptAnalysis( reportedResult );
				// TODO: save report to file
                const reporter = new JSONTestReporter( fileHandler, path );
                await reporter.report(
                    reportedResult,
                    { directory: options.dirResult, useTimestamp: false } as FileBasedTestReporterOptions
                );
                // ---

				if ( ! hasErrors && ( reportedResult?.total?.failed > 0 || reportedResult?.total?.error > 0 ) ) {
					hasErrors = true;
				}

			} catch ( err ) {
				hasErrors = true;
				listener.showException( err );
			}
		}

        return { success: ! hasErrors, spec };
    }

}
