import { FileUtil } from '../../modules/util/FileUtil';
import { CmdRunner } from '../../modules/cli/CmdRunner';
import { TestScriptExecutionOptions } from '../../modules/ts/TestScriptExecution';
import { CodeceptJSOptionsBuilder } from './CodeceptJSOptionsBuilder';

/**
 * Executes test scripts generated by Concordia using CodeceptJS.
 * 
 * @author Matheus Eller Fagundes
 */
export class TestScriptExecutor {
    
    constructor( private _fileUtil: FileUtil, private _cmd: CmdRunner ) {
    }

    /**
     * Executes the script according to the options given.
     * 
     * @param options Execution options
     */
    public async execute( options: TestScriptExecutionOptions ): Promise< any > {
        // It's only possible to run CodeceptJS if there is a 'codecept.json' file in the folder.
        await this._fileUtil.createFile( '{}', options.sourceCodeDir, 'codecept', 'json' );
        let testCommand: string = this.generateTestCommand( options );
        return this._cmd.run( testCommand )
            .then( ( testResult : any ) => {
                return this.writeResult( testResult, options.executionResultDir );
            } );
    }

    /**
     * Generates a command that calls CodeceptJS and can be executed in a terminal.
     * 
     * @param options Execution options
     * @throws Error
     */
    public generateTestCommand( options: TestScriptExecutionOptions ): string {
        if ( ! options.sourceCodeDir ) {
            throw new Error( 'Source code directory is missing!' );
        }
        const commandOptions: object = new CodeceptJSOptionsBuilder().value(); //TODO: Accept CodeceptJS options.
        const optionsStr: string = JSON.stringify( commandOptions );
        return `codeceptjs run --reporter=JSON --override '${optionsStr}' -c ${ options.sourceCodeDir }`;
    }

    /**
     * Writes the test result in a file.
     * 
     * @param testResult Test result from CodeceptJS, in JSON format
     * @param resultDir Path where save the file
     */
    public writeResult( testResult: any, resultDir: string ): Promise<string> {
        let fileName: string = this.generateResultFileName();
        return this._fileUtil.createFile( JSON.stringify( testResult ), resultDir, fileName, 'json' );
    }

    /**
     * Generates the test results file name without the extension.
     * The file name contains the date and time of tests execution.
     */
    private generateResultFileName(): string {
        let dateString: string = new Date()
            .toISOString()
            .replace(/\.\w*/, '')
            .replace('T', '_')
            .replace(':', 'h')
            .replace(':', 'm')
            .concat('s');
        return `codecept_${ dateString }`;
    }

}
