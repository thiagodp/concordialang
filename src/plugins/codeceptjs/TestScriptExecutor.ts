import { CmdRunner } from '../../modules/cli/CmdRunner';
import { TestScriptExecutionOptions } from '../../modules/ts/TestScriptExecution';
import { OutputFileWriter } from "../../modules/cli/OutputFileWriter";

/**
 * Executes CodeceptJS test scripts.
 * @author Matheus Eller Fagundes
 */
export class TestScriptExecutor {

    private _fileWriter: OutputFileWriter;
    private _cmd: CmdRunner;
    
    constructor( fileWriter: OutputFileWriter, cmd: CmdRunner ) {
        this._fileWriter = fileWriter;
        this._cmd = cmd;
    }

    /**
     * 
     */
    public execute( options: TestScriptExecutionOptions ): Promise<any> {
        // It's only possible to run CodeceptJS if there is a 'codecept.json' file in the folder.
        this._fileWriter.write( '{}', options.sourceCodeDir, 'codecept', 'json' );
        let commandConfig: any = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js"            
        };
        let testCommand: string = `codeceptjs run --steps --override '${ JSON.stringify( commandConfig ) }' -c ${ options.sourceCodeDir }`;
        return this._cmd.run( testCommand );
    }

}
