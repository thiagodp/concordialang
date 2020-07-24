import { CompilerListener } from '../compiler/CompilerListener';
import { FileCompilationListener } from '../compiler/FileCompilationListener';
import { PluginListener } from '../plugin/PluginListener';
import { TestCaseGeneratorListener } from '../testcase/TestCaseGeneratorListener';
import { TestScriptExecutionListener } from '../testscript/TestScriptExecutionListener';
import { AppOptions } from './AppOptions';

export interface UI extends
    FileCompilationListener,
    CompilerListener,
    TestCaseGeneratorListener,
    PluginListener,
    TestScriptExecutionListener
{

	setDebugMode( debugMode: boolean ): void;

	// BASIC UI

    success( ...args: any[] ): void;
    info( ...args: any[] ): void;
    warn( ...args: any[] ): void;
	error( ...args: any[] ): void;

	showException( error: Error ): void;

	// CLI


    showHelp( content: string ): void;
    showAbout( { description, version, author, homepage } ): void;
    showVersion( version: string ): void;

    announceOptions( options: AppOptions ): void;

    // Update

    announceUpdateAvailable( link: string, isMajor: boolean ): void;

    announceNoUpdateAvailable(): void;

    // Configuration

    announceConfigurationFileAlreadyExists(): void;

    announceConfigurationFileLoaded( filePath: string, durationMS: number ): void;
    announceCouldNotLoadConfigurationFile( errorMessage: string ): void;

    announceConfigurationFileSaved( filePath: string ): void;

    // Plug-in

    announcePluginNotFound( pluginName: string ): void;

    announcePluginCouldNotBeLoaded( pluginName: string ): void;

    announceNoPluginWasDefined(): void;

	announceReportFile( filePath: string ): void;
    announceReportFileNotFound( filePath: string ): void;

    // Language

    drawLanguages( languages: string[] ): void;

    // Database

    announceDatabasePackagesInstallationStarted(): void;
    announceDatabasePackage( packageName: string ): void;
	announceDatabasePackagesInstallationFinished( code: number ): void;

	// Locale
	drawLocales( locales: string[], localeType?: string, note?: string ): void;

    // AST

    showErrorSavingAbstractSyntaxTree( astFile: string, errorMessage: string ): void;
    announceAbstractSyntaxTreeIsSaved( astFile: string ): void;

    // Test Script

    showGeneratedTestScriptFiles( scriptDir: string, files: string[], durationMS: number ): void;
    showTestScriptGenerationErrors( errors: Error[] ): void;

}
