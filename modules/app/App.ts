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
import { loadPlugin } from '../plugin/plugin-loader';
import { filterPluginsByName } from '../plugin/PluginData';
import { FileBasedTestReporterOptions } from '../report/FileBasedTestReporter';
import { JSONTestReporter } from '../report/JSONTestReporter';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { AbstractTestScriptGenerator } from '../testscript/AbstractTestScriptGenerator';
import { TestResultAnalyzer } from '../testscript/TestResultAnalyzer';
import { DirSearcher } from '../util/file';
import { FSDirSearcher, FSFileHandler } from '../util/fs';
import { AppListener } from './app-listener';
import { AppOptions, hasSomeOptionThatRequiresAPlugin } from './options/app-options';

type AppResult = {
	spec?: Spec,
	success: boolean,
};

export function runApp(
	libs: { fs: any, path: any, promisify: any },
	options: AppOptions,
	listener: AppListener
): Promise< AppResult > {
	const app = new App( libs.fs, libs.path, libs.promisify );
	return app.start( options, listener );
}

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

		let plugin: Plugin;
		let isPluginLoaded: boolean = false;

		if ( hasSomeOptionThatRequiresAPlugin( options ) && options.plugin ) {

			const dirSearcher: DirSearcher = new FSDirSearcher( fs, promisify );

			const pluginFinder = new PackageBasedPluginFinder( options.processPath, fileHandler, dirSearcher );

            try {
				const all = await pluginFinder.find();
                const pluginData = await filterPluginsByName( all, options.plugin );
                if ( ! pluginData ) {
                    listener.announcePluginNotFound( options.plugin );
                    return { success: false };;
                }
                plugin = await loadPlugin( pluginData );
            } catch ( err ) {
                listener.showException( err );
                return { success: false };
            }
            if ( ! plugin ) { // needed?
                listener.announcePluginCouldNotBeLoaded( options.plugin );
                return { success: false };
            } else {
				isPluginLoaded = true;
			}

            // can continue
		}

		if ( ! options.plugin && ( options.script || options.run || options.result ) ) {
            listener.announceNoPluginWasDefined();
            return { success: false };
		}

		// Compile

        let hasErrors: boolean = false;
        let spec: AugmentedSpec = null;

        listener.announceOptions( options );

        if ( options.spec ) {
            const compiler = new CompilerFacade( fs, promisify, listener, listener );
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
        let tseo: TestScriptExecutionOptions;

        if ( spec && options.script ) { // Requires spec and a plugin

            let docs: Document[] = spec.docs;

            const atsGenerator = new AbstractTestScriptGenerator();
            abstractTestScripts = atsGenerator.generate( docs, spec );

            if ( !! plugin.generateCode && abstractTestScripts.length > 0 ) {

                const startTime = Date.now();

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

        let executionResult: TestScriptExecutionResult;

        const shouldExecuteScripts: boolean =  isPluginLoaded && !! plugin.executeCode &&
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

            tseo = {
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

		if ( options.result &&
            !! plugin.defaultReportFile &&
            !! plugin.convertReportFile
            ) { // Requires a plugin

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

                if ( !! plugin?.beforeReporting ) {
                    await plugin.beforeReporting( reportedResult, tseo );
                }

				listener.showTestScriptAnalysis( reportedResult );

				// Save report to file ---
                const reporter = new JSONTestReporter( fileHandler );
                await reporter.report(
                    reportedResult,
                    { directory: options.dirResult, useTimestamp: false } as FileBasedTestReporterOptions
                );
                // ---

                if ( !! plugin?.afterReporting ) {
                    await plugin.afterReporting( reportedResult, tseo );
                }

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
