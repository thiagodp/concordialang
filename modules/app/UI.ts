import { CompilerListener } from '../compiler/CompilerListener';
import { FileCompilationListener } from '../compiler/FileCompilationListener';
import { PluginListener } from '../plugin/PluginListener';
import { TestCaseGeneratorListener } from '../testcase/TestCaseGeneratorListener';
import { TestScriptExecutionListener } from '../testscript/TestScriptExecutionListener';
import { Options } from './Options';

export interface UI extends
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

    announceConfigurationFileLoaded( filePath: string, durationMS: number ): void;
    announceCouldNotLoadConfigurationFile( errorMessage: string ): void;

    announceConfigurationFileSaved( filePath: string ): void;

    // Plug-in

    announcePluginNotFound( pluginDir: string, pluginName: string ): void;

    announcePluginCouldNotBeLoaded( pluginName: string ): void;

    announceNoPluginWasDefined(): void;

    announceReportFileNotFound( filePath: string ): void;

    // Language

    drawLanguages( languages: string[] ): void;

    // Database

    announceDatabasePackagesInstallationStarted(): void;
    announceDatabasePackage( packageName: string ): void;
    announceDatabasePackagesInstallationFinished( code: number ): void;

    // AST

    showErrorSavingAbstractSyntaxTree( astFile: string, errorMessage: string ): void;
    announceAbstractSyntaxTreeIsSaved( astFile: string ): void;

    // Test Script

    showGeneratedTestScriptFiles( scriptDir: string, files: string[], durationMS: number ): void;
    showTestScriptGenerationErrors( errors: Error[] ): void;

    // Generic

    showException( error: Error ): void;

    success( ...args: any[] ): void;
    info( ...args: any[] ): void;
    warn( ...args: any[] ): void;
    error( ...args: any[] ): void;

}