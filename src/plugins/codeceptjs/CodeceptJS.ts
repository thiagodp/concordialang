import { TestScriptGenerator } from './TestScriptGenerator';
import { TestScriptPlugin } from '../../modules/ts/TestScriptPlugin';
import { AbstractTestScript } from '../../modules/ts/AbstractTestScript';
import { TestScriptGenerationOptions } from '../../modules/ts/TestScriptGeneration';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/ts/TestScriptExecution';
import { CmdRunner } from "../../modules/cli/CmdRunner";
import { OutputFileWriter } from "../../modules/cli/OutputFileWriter";

import * as fs from 'fs';
import * as util from 'util';

/**
 * Plugin for CodeceptJS.
 * 
 * @author Thiago Delgado Pinto
 * @author Matheus Eller Fagundes
 */
export class CodeceptJS implements TestScriptPlugin {
   
    private _cmd: CmdRunner;
    private _fileWriter: OutputFileWriter;

    private _scriptGenerator: TestScriptGenerator = new TestScriptGenerator();
    private _writeFile = util.promisify( fs.writeFile );

    private VERSION: string = '0.1';

    constructor( private _fs: any, private _encoding: string = 'utf8' ) {
        this._cmd = new CmdRunner();
        this._fileWriter = new OutputFileWriter();
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
    generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions
    ): Promise< string >[] {
        return abstractTestScripts.map( this.processTestScript );
    }

    /**
     * Tries to generate a source code file from an abstract test script.
     * 
     * *Important*: This function should keep the fat arrow style, () => {}, in
     * order to preverse the context of `this`.
     * 
     * @param ats Abstract test script
     * @returns A promise with the file name as the data.
     */
    private processTestScript = ( ats: AbstractTestScript ): Promise< string > => {

        return new Promise( ( resolve, reject ) => {
            let fileName: string = this.makeFileNameFromFeature( ats.feature.name );
            let code: string = this._scriptGenerator.generate( ats );
            this._fs.writeFile( fileName, code, this._encoding, ( err ) => {
                if ( err ) {
                    reject( err );
                } else {
                    resolve( fileName );
                }
            } );
        } );

    };

    private makeFileNameFromFeature( featureName: string ): string {
        return featureName.toLowerCase().replace( /( )/g, '-' ) + '.js';
    }


    /** @inheritDoc */
    public executeCode( options: TestScriptExecutionOptions ): TestScriptExecutionResult {
        // It's only possible to run CodeceptJS if there is a 'codecept.json' file in the folder.
        this._fileWriter.write( '{}', options.scriptDir, 'codecept', 'json' );
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
        this._cmd.run( testCommand, ( err, data )=>{
            // TODO: get test results
        });
        return null;
    }

    /** @inheritDoc */
    public convertReportFile( filePath: string ): TestScriptExecutionResult {
        throw new Error('Not implemented yet.');
    }
}
