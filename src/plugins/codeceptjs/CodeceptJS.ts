import { TestScriptExecutor } from './TestScriptExecutor';
import { TestScriptGenerator } from './TestScriptGenerator';
import { ReportConverter } from './ReportConverter';
import { TestScriptPlugin } from '../../modules/ts/TestScriptPlugin';
import { AbstractTestScript } from '../../modules/ts/AbstractTestScript';
import { TestScriptGenerationOptions } from '../../modules/ts/TestScriptGeneration';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/ts/TestScriptExecution';
import { CmdRunner } from "../../modules/cli/CmdRunner";
import { FileUtil } from '../../modules/util/FileUtil';

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
    private _reportConverter: ReportConverter;

    private readonly PLUGIN_CONFIG_PATH: string = path.join( __dirname, '../', 'codeceptjs.json' );

    constructor( private _fs?: any, private _encoding: string = 'utf8' ) {

        _fs = _fs || fs; // assumes the Node's fs as the default

        this._scriptGenerator = new TestScriptGenerator();
        this._scriptExecutor = new TestScriptExecutor(
            new FileUtil( _fs ),
            new CmdRunner()
        );
        this._reportConverter = new ReportConverter( _fs );
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
        return this._reportConverter.convertFrom( filePath, this.PLUGIN_CONFIG_PATH );
    }
}
