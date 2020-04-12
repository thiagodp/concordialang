import { CompilerListener } from './CompilerListener';
import { ScriptExecutionListener } from './ScriptExecutionListener';
import { FileCompilationListener } from './FileCompilationListener';
import { TCGenListener } from './TCGenListener';
import { Options } from '../Options';

export interface AppUI extends
    FileCompilationListener,
    CompilerListener,
    TCGenListener,
    ScriptExecutionListener
{

    setDebugMode( debugMode: boolean ): void;

    show( ...args: any[] ): void;
    success( ...args: any[] ): void;
    info( ...args: any[] ): void;
    warn( ...args: any[] ): void;
    error( ...args: any[] ): void;

    exception( error: Error ): void;

    // TO-DO: Move to UpdateListener ?
    announceUpdateAvailable( link: string, isMajor: boolean ): void;
    announceNoUpdateAvailable(): void;

    // TO-DO: Move to OptionsListener ?
    announceOptions( options: Options ): void;

}