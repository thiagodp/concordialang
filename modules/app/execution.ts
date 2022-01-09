import {
    AbstractTestScript,
    Plugin,
    TestScriptExecutionOptions,
    TestScriptGenerationOptions,
    TestScriptGenerationResult,
} from 'concordialang-plugin';
import { TestScriptExecutionResult } from 'concordialang-types';
import { promisify } from 'util';

import { Spec } from '../ast';
import { CompilerFacade } from '../compiler/CompilerFacade';
import { PackageBasedPluginFinder } from '../plugin/PackageBasedPluginFinder';
import { filterPluginsByName } from '../plugin/plugin-filter';
import { loadPlugin } from '../plugin/plugin-loader';
import { NewOrOldPluginData } from '../plugin/PluginData';
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

type PluginInfo = {
    plugin: Plugin,
    pluginData: NewOrOldPluginData,
    generatedTestScriptFiles?: string[],
    errors?: Error[],
    testScriptExecutionOptions?: TestScriptExecutionOptions,
    executionResult?: TestScriptExecutionResult,
};

export async function runApp(
	libs: { fs: any, path: any },
	options: AppOptions,
	listener: AppListener
): Promise< AppResult > {

    const { fs } = libs;

    const fileHandler = new FSFileHandler( fs, promisify, options.encoding );

    //
    // Plug-in loading
    //

    const pluginsInfo: PluginInfo[] = [];

    if ( hasSomeOptionThatRequiresAPlugin( options ) && options.plugin ) {

        const dirSearcher: DirSearcher = new FSDirSearcher( fs, promisify );

        const pluginFinder = new PackageBasedPluginFinder( options.processPath, fileHandler, dirSearcher );

        try {
            const all = await pluginFinder.find();
            const pluginsData = await filterPluginsByName( all, options.plugin );
            if ( ! pluginsData || pluginsData.length < 1 ) {
                listener.announcePluginsNotFound( options.plugin );
                return { success: false };
            }
            for ( const pluginData of pluginsData ) {
                try {
                    const plugin = await loadPlugin( pluginData );
                    pluginsInfo.push( { plugin, pluginData } );
                } catch ( err ) {
                    listener.showException( err as Error );
                }
            }
        } catch ( err ) {
            listener.showException( err as Error );
            return { success: false };
        }

        if ( pluginsInfo.length < 1 ) { // needed?
            listener.announcePluginsCouldNotBeLoaded( options.plugin );
            return { success: false };
        }
    }

    if ( ! options.plugin && ( options.script || options.run || options.result ) ) {
        listener.announceNoPluginWasDefined();
        return { success: false };
    }

    listener.announceOptions( options );

    let hasErrors: boolean = false;

    //
    // Compilation
    //

    let spec: AugmentedSpec | null = null;

    if ( options.spec ) {
        const compiler = new CompilerFacade( fs, promisify, listener, listener );
        try {
            [ spec, /* graph */ ] = await compiler.compile( options );
        } catch ( err ) {
            hasErrors = true;
            listener.showException( err as Error );
        }

        if ( ! spec && options.file && options.file.length > 0 ) {
            return { success: ! hasErrors };
        }
    }

    //
    // Abstract test scripts generation
    //

    let abstractTestScripts: AbstractTestScript[] = [];

    if ( spec && options.script ) { // Requires spec and a plugin

        // Generate abstract test scripts
        const atsGenerator = new AbstractTestScriptGenerator();
        abstractTestScripts = atsGenerator.generate( spec.docs, spec );

        // Convert into test scripts
        const anyErrors: boolean = await convertAbstractTestScriptsIntoTestScripts(
            abstractTestScripts, pluginsInfo, options, listener )

        hasErrors = hasErrors || anyErrors;
    }

    //
    // Test scripts execution
    //

    if ( options.run ) {
        const anyErrors: boolean = await executeTestScripts( pluginsInfo, options, listener );
        hasErrors = hasErrors || anyErrors;
    }

    //
    // Report
    //

    if ( options.result ) {
        const anyErrors: boolean = await reportTestScriptResults(
            abstractTestScripts, pluginsInfo, options, listener, libs );

        hasErrors = hasErrors || anyErrors;
    }


    return { success: ! hasErrors, spec: spec || undefined };
}



async function convertAbstractTestScriptsIntoTestScripts(
    abstractTestScripts: AbstractTestScript[],
    pluginsInfo: PluginInfo[],
    options: AppOptions,
    listener: AppListener,
): Promise< boolean > {

    let hasErrors: boolean = false;

    for ( const pInfo of pluginsInfo ) {

        const { plugin, pluginData } = pInfo;

        if ( !! plugin.generateCode && abstractTestScripts.length > 0 ) {

            const startTime = Date.now();

            try {
                const r: TestScriptGenerationResult = await plugin.generateCode(
                    abstractTestScripts,
                    new TestScriptGenerationOptions(
                        pluginData.name,
                        options.dirScript,
                        options.directory
                    )
                );

                pInfo.generatedTestScriptFiles = r?.generatedFiles || [];
                pInfo.errors = r?.errors || [];
            } catch ( err ) {
                hasErrors = true;
                listener.showException( err as Error );
            }

            const durationMS = Date.now() - startTime;

            listener.showGeneratedTestScriptFiles(
                options.dirScript!,
                pInfo.generatedTestScriptFiles || [],
                durationMS
            );

            if ( pInfo.errors ) {
                listener.showTestScriptGenerationErrors( pInfo.errors );
            }
        }
    }

    return hasErrors;
}



async function executeTestScripts(
    pluginsInfo: PluginInfo[],
    options: AppOptions,
    listener: AppListener,
): Promise< boolean > {

    let hasErrors: boolean = false;

    // Not needed to execute test scripts
    if ( ! options.run ) {
        return hasErrors;
    }

    const optionsHaveDefinedScriptFilesToRun: boolean = ( !! options.scriptFile && options.scriptFile.length > 0 );

    const tseo: TestScriptExecutionOptions = {
        dirScript: options.dirScript,
        dirResult: options.dirResult,
        file: undefined,
        grep: options.scriptGrep || undefined,
        target: options.target || undefined,
        headless: options.headless || undefined,
        instances: options.instances || undefined,
        // parameters: options.pluginOption || undefined,
    } as TestScriptExecutionOptions;

    for ( const pInfo of pluginsInfo ) {

        const { plugin, generatedTestScriptFiles } = pInfo;

        const pluginCanExecuteCode: boolean = !! plugin.executeCode;
        if ( ! pluginCanExecuteCode ) {
            continue;
        }

        const pluginContainsGeneratedScriptFiles: boolean = ( !! generatedTestScriptFiles && generatedTestScriptFiles.length > 0 );

        const shouldExecuteScripts: boolean =  pluginCanExecuteCode &&
            ( optionsHaveDefinedScriptFilesToRun || pluginContainsGeneratedScriptFiles );

        if ( ! shouldExecuteScripts ) {
            continue;
        }

        // Execution requires a plugin, but NOT a spec

        // console.log( '>>>', 'generatedTestScriptFiles', generatedTestScriptFiles );

        const scriptFiles: string | undefined = optionsHaveDefinedScriptFilesToRun
            ? options.scriptFile!.join( ',' )
            : pluginContainsGeneratedScriptFiles
                ? generatedTestScriptFiles!.join( ',' )
                : undefined;

        listener.announceTestScriptExecutionStarted();

        try {
            pInfo.testScriptExecutionOptions = { ...tseo };
            pInfo.testScriptExecutionOptions.file = scriptFiles; // Every plugin executes its own test scripts
            pInfo.executionResult = await plugin.executeCode!( pInfo.testScriptExecutionOptions );

            if ( ! hasErrors &&
                ( pInfo.executionResult?.total?.failed > 0 || pInfo.executionResult?.total?.error > 0 )
            ) {
                hasErrors = true;
            }

        } catch ( err ) {
            hasErrors = true;
            listener.announceTestScriptExecutionError( err as Error );
        }

        listener.announceTestScriptExecutionFinished();
    }

    return hasErrors;
}



async function reportTestScriptResults(
    abstractTestScripts: AbstractTestScript[],
    pluginsInfo: PluginInfo[],
    options: AppOptions,
    listener: AppListener,
    libs: { fs: any, path: any },
): Promise< boolean > {

    let hasErrors: boolean = false;

    if ( ! options.result ) {
        return hasErrors;
    }

    const { fs, path } = libs;

    for ( const pInfo of pluginsInfo ) {

        const { plugin } = pInfo;

        if ( !! plugin.defaultReportFile && !! plugin.convertReportFile ) {

            let reportFile: string;

            if ( ! pInfo.executionResult ) {

                const defaultReportFile: string = path.join(
                    options.dirResult,
                    await plugin.defaultReportFile()
                );

                if ( ! fs.existsSync( defaultReportFile ) ) {
                    listener.announceReportFileNotFound( defaultReportFile );
                    hasErrors = true;
                    continue;
                }

                reportFile = defaultReportFile;
            } else {
                reportFile = pInfo.executionResult.sourceFile;
            }

            if ( reportFile ) {

                listener.announceReportFile( reportFile );
                try {
                    pInfo.executionResult = await plugin.convertReportFile( reportFile );
                } catch ( err ) {
                    hasErrors = true;
                    listener.showException( err as Error );
                }
            }

        }


        if ( pInfo.executionResult ) {
            try {
                const reportedResult = ( new TestResultAnalyzer() ).adjustResult(
                    pInfo.executionResult,
                    abstractTestScripts
                );

                if ( !! plugin?.beforeReporting ) {
                    await plugin.beforeReporting( reportedResult, pInfo.testScriptExecutionOptions );
                }

                listener.showTestScriptAnalysis( reportedResult );

                // Save report to file ---
                const fileHandler = new FSFileHandler( fs, promisify, options.encoding );
                const reporter = new JSONTestReporter( fileHandler );
                await reporter.report(
                    reportedResult,
                    { directory: options.dirResult, useTimestamp: false } as FileBasedTestReporterOptions
                );
                // ---

                if ( !! plugin?.afterReporting ) {
                    await plugin.afterReporting( reportedResult, pInfo.testScriptExecutionOptions );
                }

                if ( ! hasErrors && ( reportedResult?.total?.failed > 0 || reportedResult?.total?.error > 0 ) ) {
                    hasErrors = true;
                }

            } catch ( err ) {
                hasErrors = true;
                listener.showException( err as Error );
            }
        }

    }

    return hasErrors;
}
