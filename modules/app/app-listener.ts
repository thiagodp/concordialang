import { CompilerListener } from '../compiler/CompilerListener';
import { FileCompilationListener } from '../compiler/FileCompilationListener';
import { PluginListener } from '../plugin/PluginListener';
import { TestCaseGeneratorListener } from '../testcase/TestCaseGeneratorListener';
import { TestScriptExecutionListener } from '../testscript/TestScriptExecutionListener';
import { AppOptions } from './app-options';

export interface AppListener extends
    FileCompilationListener,
    CompilerListener,
    TestCaseGeneratorListener,
    PluginListener,
    TestScriptExecutionListener
    {

    // Basic

    showException( error: Error ): void;

    // TO-DO: Remove these, since is CLI-only ---------------------------------

    announceOptions( options: AppOptions ): void;

    announceUpdateAvailable( url: string, hasBreakingChange: boolean ): void;

    announceNoUpdateAvailable(): void;

    announceConfigurationFileAlreadyExists(): void;

    announcePluginNotFound( pluginName: string ): void;

    announcePluginCouldNotBeLoaded( pluginName: string ): void;

    announceNoPluginWasDefined(): void;

	announceReportFile( filePath: string ): void;

    announceReportFileNotFound( filePath: string ): void;

    drawLanguages( languages: string[] ): void;


    showGeneratedTestScriptFiles( scriptDir: string, files: string[], durationMS: number ): void;

    showTestScriptGenerationErrors( errors: Error[] ): void;

}