import { CompilerListener } from './CompilerListener';
import { ScriptExecutionListener } from './ScriptExecutionListener';
import { FileCompilationListener } from './FileCompilationListener';
import { TCGenListener } from './TCGenListener';

export interface AppUI extends
    FileCompilationListener,
    CompilerListener,
    TCGenListener,
    ScriptExecutionListener
{

    setDebugMode( debugMode: boolean ): void;

    showError( error: Error, debugMode: boolean ): void;

}