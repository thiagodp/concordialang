import { AbstractTestScript, Plugin, TestScriptExecutionOptions, TestScriptExecutionResult, TestScriptGenerationOptions, TestScriptGenerationResult } from 'concordialang-plugin';
import { Document } from '../ast';
import { CompilerFacade } from '../compiler/CompilerFacade';
import { LanguageManager } from '../language/LanguageManager';
import { PackageBasedPluginFinder } from '../plugin/PackageBasedPluginFinder';
import { PluginController } from '../plugin/PluginController';
import { PluginData } from '../plugin/PluginData';
import { PluginManager } from '../plugin/PluginManager';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { AbstractTestScriptGenerator } from '../testscript/AbstractTestScriptGenerator';
import { TestResultAnalyzer } from '../testscript/TestResultAnalyzer';
import { DirSearcher, FileSearcher, FSDirSearcher, FSFileHandler, FSFileSearcher } from '../util/file';
import { Options } from "./Options";
import { UI } from './UI';

/**
 * Application facade
 *
 * @author Thiago Delgado Pinto
 */
export class App {

    constructor(
        private _fs: any,
        private _path: any
    ) {
    }

    async start( options: Options, ui: UI ): Promise< boolean > {

        const fs = this._fs;
        const path = this._path;

        let pluginData: PluginData = null;

        const dirSearcher: DirSearcher = new FSDirSearcher( fs );
        const fileSearcher: FileSearcher = new FSFileSearcher( fs );
        const fileHandler = new FSFileHandler( fs, options.encoding );

        const pluginManager: PluginManager = new PluginManager(
            ui,
            new PackageBasedPluginFinder( options.processPath, fileHandler, dirSearcher ),
            fileHandler
            );

        let plugin: Plugin = null;

        if ( options.somePluginOption() ) {
            const pluginController: PluginController = new PluginController();
            try {
                await pluginController.process( options, pluginManager, ui );
            } catch ( err ) {
                ui.showException( err );
                return false;
            }
            return true;

        } else if ( options.someOptionThatRequiresAPlugin() && options.hasPluginName() ) {
            try {
                pluginData = await pluginManager.pluginWithName( options.plugin );
                if ( ! pluginData ) {
                    ui.announcePluginNotFound( options.pluginDir, options.plugin );
                    return false;
                }
                plugin = await pluginManager.load( pluginData );
            } catch ( err ) {
                ui.showException( err );
                return false;
            }
            if ( ! plugin ) { // needed?
                ui.announcePluginCouldNotBeLoaded( options.plugin );
                return false;
            }

            // can continue
        }

        if ( options.languageList ) {

            const lm = new LanguageManager( fileSearcher, options.languageDir );
            try {
                const languages: string[] = await lm.availableLanguages();
                ui.drawLanguages( languages );
            } catch ( err ) {
                ui.showException( err );
                return false;
            }
            return true;
        }

        let hasErrors: boolean = false;
        let spec: AugmentedSpec = null;

        ui.announceOptions( options );

        if ( options.compileSpecification ) {
            const compiler = new CompilerFacade( fs, path, ui, ui );
            try {
				[ spec, /* graph */ ] = await compiler.compile( options );
            } catch ( err ) {
                hasErrors = true;
                ui.showException( err );
            }
		}

		if ( null === spec && options.file.length > 0 ) {
			return true; // hasErrors
		}

        if ( spec && options.ast ) {

            const getCircularReplacer = () => {
                const seen = new WeakSet();
                return ( /* key , */ value ) => {
                    if ( 'object' === typeof value && value !== null ) {
                        if (seen.has(value)) {
                            return;
                        }
                        seen.add(value);
                    }
                    return value;
                };
            };

            try {
                await fileHandler.write( options.ast, JSON.stringify( spec, getCircularReplacer(), "  " ) );
            } catch ( e ) {
                ui.showErrorSavingAbstractSyntaxTree( options.ast, e.message );
                return false;
            }
            ui.announceAbstractSyntaxTreeIsSaved( options.ast );
            return true;
        }

        if ( ! plugin && ( options.generateScript || options.executeScript || options.analyzeResult ) ) {
            ui.announceNoPluginWasDefined();
            return true;
        }

        // Abstract test scripts

        let abstractTestScripts: AbstractTestScript[] = [];
        let generatedTestScriptFiles: string[] = [];

        if ( spec && options.generateScript ) { // Requires spec and a plugin

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
                    ui.showException( err );
                }

                const durationMS = Date.now() - startTime;

                ui.showGeneratedTestScriptFiles(
                    options.dirScript,
                    generatedTestScriptFiles,
                    durationMS
                );

                ui.showTestScriptGenerationErrors( errors );
            }
        }

        let executionResult: TestScriptExecutionResult = null;

        const shouldExecuteScripts: boolean =  !! plugin &&
            ( options.executeScript &&
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
                file: scriptFiles || [],
                grep: options.scriptGrep || undefined,
                target: options.target || undefined,
                headless: options.headless || undefined,
                instances: options.instances || undefined,
                // parameters: options.pluginOption || undefined,
            } as TestScriptExecutionOptions;

            ui.announceTestScriptExecutionStarted();

            try {
                executionResult = await plugin.executeCode( tseo );
            } catch ( err ) {
                hasErrors = true;
                ui.announceTestScriptExecutionError( err );
            }

            ui.announceTestScriptExecutionFinished();
        }

        if ( ! hasErrors && ( executionResult?.total?.failed > 0 || executionResult?.total?.error > 0 ) ) {
            hasErrors = true;
        }

        if ( options.analyzeResult ) { // Requires a plugin

            let reportFile: string;
            if ( ! executionResult  ) {

                const defaultReportFile: string = path.join(
                    options.dirResult, await plugin.defaultReportFile() );

                if ( ! fs.existsSync( defaultReportFile ) ) {
                    ui.announceReportFileNotFound( defaultReportFile );
                    return false;
                }

                reportFile = defaultReportFile;
            } else {
                reportFile = executionResult.sourceFile;
            }

            try {
                let reportedResult = await plugin.convertReportFile( reportFile );
                reportedResult = ( new TestResultAnalyzer() ).adjustResult( reportedResult, abstractTestScripts );
                ui.showTestScriptAnalysis( reportedResult );

                if ( ! hasErrors && ( reportedResult?.total?.failed > 0 || reportedResult?.total?.error > 0 ) ) {
                    hasErrors = true;
                }

            } catch ( err ) {
                hasErrors = true;
                ui.showException( err );
            }

        }

        return ! hasErrors;
    }

}
