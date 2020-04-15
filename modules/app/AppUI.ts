import { CompilerListener } from '../compiler/CompilerListener';
import { FileCompilationListener } from '../compiler/FileCompilationListener';
import { PluginListener } from '../plugin/PluginListener';
import { TestCaseGeneratorListener } from '../testcase/TestCaseGeneratorListener';
import { TestScriptExecutionListener } from '../testscript/TestScriptExecutionListener';
import { Options } from './Options';
import { OptionsListener } from './OptionsListener';

export interface AppUI extends
    OptionsListener,
    FileCompilationListener,
    CompilerListener,
    TestCaseGeneratorListener,
    PluginListener,
    TestScriptExecutionListener
{

    setDebugMode( debugMode: boolean ): void;


    showHelp(): void;
    showAbout(): void;
    showVersion(): void;

    announceOptions( options: Options ): void;

    // Update

    announceUpdateAvailable( link: string, isMajor: boolean ): void;

    announceNoUpdateAvailable(): void;

    // Configuration

    announceConfigurationFileAlreadyExists(): void;

    // Plug-in

    announcePluginNotFound( pluginDir: string, pluginName: string ): void;

    announcePluginCouldNotBeLoaded( pluginName: string ): void;

    announceNoPluginWasDefined(): void;

    announceReportFileNotFound( filePath: string ): void;

    // Language

    drawLanguages( languages: string[] ): void;

    // AST

    showErrorSavingAST( astFile: string, errorMessage: string ): void;
    announceASTIsSaved( astFile: string ): void;

    // Test Script

    showGeneratedTestScriptFiles( scriptDir: string, files: string[] ): void;
    showTestScriptGenerationErrors( errors: Error[] ): void;

    // Generic

    show( ...args: any[] ): void;
    success( ...args: any[] ): void;
    info( ...args: any[] ): void;
    warn( ...args: any[] ): void;
    error( ...args: any[] ): void;

    exception( error: Error ): void;

}