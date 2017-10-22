import { TestScriptPlugin } from '../../modules/ts/TestScriptPlugin';
import { AbstractTestScript } from '../../modules/ts/AbstractTestScript';
import { TestScriptGenerationOptions, TestScriptGenerationResult } from '../../modules/ts/TestScriptGeneration';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/ts/TestScriptExecution';
import { CmdRunner } from "../../modules/cli/CmdRunner";
import { OutputFileWriter } from "../../modules/cli/OutputFileWriter";

/**
 * Plugin for CodeceptJS.
 * 
 * @author Thiago Delgado Pinto
 * @author Matheus Eller Fagundes
 */
export class CodeceptJS implements TestScriptPlugin {
   
    private cmd: CmdRunner;
    private fileWriter: OutputFileWriter;

    private VERSION: string = '0.1';
    private lastScriptDir: string = '';

    constructor() {
        this.cmd = new CmdRunner();
        this.fileWriter = new OutputFileWriter();
    }

    /** @inheritDoc */
    public isFake(): boolean {
        return false;    
    }
    
    /** @inheritDoc */
    public name(): string {
        return 'concordialang-codeceptjs';
    }

    /** @inheritDoc */
    public description(): string {
        return 'Generate test scripts for CodeceptJS'
    }

    /** @inheritDoc */
    public version(): string {
        return this.VERSION;
    }

    /** @inheritDoc */
    public targets(): string[] {
        return [ 'CodeceptJS' ];
    }

    /** @inheritDoc */
    public authors(): string[] {
        return [
            'Matheus Eller Fagundes (matheusefagundes@gmail.com)',
            'Thiago Delgado Pinto (thiago-dp@bol.com.br)'
        ];
    }    

    /** @inheritDoc */
    public generateCode( abstractTestScripts: AbstractTestScript[], options: TestScriptGenerationOptions ): TestScriptGenerationResult {
        this.lastScriptDir = options.scriptDir;
        throw new Error('Not implemented yet.');
    }

    /** @inheritDoc */
    public executeCode( options: TestScriptExecutionOptions ): TestScriptExecutionResult {
        // It's only possible to run CodeceptJS if there is a 'codecept.json' file in the folder.
        this.fileWriter.write( '{}', this.lastScriptDir, 'codecept', 'json' );
        let commandConfig: any = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js"            
        };
        let testCommand: string = `codeceptjs run --steps --override '${ JSON.stringify( commandConfig ) }' -c ${ this.lastScriptDir }`;
        this.cmd.run( testCommand, ( err, data )=>{
            // TODO: get test results
        });
        return null;
    }

    /** @inheritDoc */
    public convertReportFile( filePath: string ): TestScriptExecutionResult {
        throw new Error('Not implemented yet.');
    }
}
