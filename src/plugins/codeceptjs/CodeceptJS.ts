import { TestScriptExecutor } from './TestScriptExecutor';
import { TestScriptGenerator } from './TestScriptGenerator';
import { TestScriptPlugin } from '../../modules/ts/TestScriptPlugin';
import { AbstractTestScript } from '../../modules/ts/AbstractTestScript';
import { TestScriptGenerationOptions } from '../../modules/ts/TestScriptGeneration';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/ts/TestScriptExecution';
import { CmdRunner } from "../../modules/cli/CmdRunner";
import { OutputFileWriter } from "../../modules/util/OutputFileWriter";

import * as fs from 'fs';
import * as path from 'path';

/**
 * Plugin for CodeceptJS.
 * 
 * @author Thiago Delgado Pinto
 * @author Matheus Eller Fagundes
 */
export class CodeceptJS implements TestScriptPlugin {
   
    private _scriptGenerator: TestScriptGenerator;
    private _scriptExecutor: TestScriptExecutor;

    private VERSION: string = '0.1';

    constructor( private _fs?: any, private _encoding: string = 'utf8' ) {

        _fs = _fs || fs; // assumes the Node's fs as the default

        this._scriptGenerator = new TestScriptGenerator();
        this._scriptExecutor = new TestScriptExecutor(
            new OutputFileWriter( _fs ),
            new CmdRunner()
        );
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
    public generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions
    ): Promise< string >[] {
        //return abstractTestScripts.map( this.processTestScript );
        let promises: Promise< string >[] = [];
        for ( let ats of abstractTestScripts ) {
            promises.push( this.processTestScript( ats, options.sourceCodeDir ) );
        }
        return promises;
    }

    /**
     * Tries to generate a source code file from an abstract test script.
     * 
     * *Important*: This function should keep the fat arrow style, () => {}, in
     * order to preverse the context of `this`.
     * 
     * @param ats Abstract test script
     * @param targetDir Directory where to put the source code.
     * @returns A promise with the file name as the data.
     */
    private processTestScript = ( ats: AbstractTestScript, targetDir: string ): Promise< string > => {

        return new Promise( ( resolve, reject ) => {
            const fileName: string = this.makeFileNameFromFeature( ats.feature.name );
            const filePath: string = path.join( targetDir, fileName );
            const code: string = this._scriptGenerator.generate( ats );
            this._fs.writeFile( filePath, code, this._encoding, ( err ) => {
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
    public executeCode( options: TestScriptExecutionOptions ): Promise< TestScriptExecutionResult > {
        return this._scriptExecutor.execute( options )
            .then( this.convertReportFile );
    }

    /** @inheritDoc */
    public convertReportFile( filePath: string ): TestScriptExecutionResult {
        throw new Error('Not implemented yet.');
    }
}
