import { TestScriptExecutor } from './TestScriptExecutor';
import { TestScriptGenerator } from './TestScriptGenerator';
import { ReportConverter } from './ReportConverter';
import { Plugin } from '../../modules/plugin/Plugin';
import { AbstractTestScript } from '../../modules/testscript/AbstractTestScript';
import { TestScriptGenerationOptions } from '../../modules/testscript/TestScriptOptions';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/testscript/TestScriptExecution';
import { CmdRunner } from "./CmdRunner";

import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'node-fs-extra';

import { promisify } from 'util';


/**
 * Plugin for CodeceptJS.
 *
 * @author Thiago Delgado Pinto
 * @author Matheus Eller Fagundes
 */
export class CodeceptJS implements Plugin {

    private readonly _fs: any;
    private _scriptGenerator: TestScriptGenerator;
    private _scriptExecutor: TestScriptExecutor;
    private _reportConverter: ReportConverter;

    private readonly PLUGIN_CONFIG_PATH: string = path.join( __dirname, '../', 'codeceptjs.json' );

    constructor(
        fsToUse?: any,
        private _encoding: string = 'utf8'
    ) {
        this._fs = ! fsToUse ? fs : fsToUse;

        this._scriptGenerator = new TestScriptGenerator();
        this._scriptExecutor = new TestScriptExecutor(
            new CmdRunner()
        );
        this._reportConverter = new ReportConverter( this._fs );
    }

    /** @inheritDoc */
    public async generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions,
        errors: Error[]
    ): Promise< string[] > {
        let files: string[] = [];
        for ( let ats of abstractTestScripts || [] ) {
            try {
                let file = await this.processTestScript( ats, options.sourceCodeDir );
                files.push( file );
            } catch ( e ) {
                const msg = 'Error generating script for "' + ats.sourceFile + '": ' + e.message;
                errors.push( new Error( msg ) );
            }
        }
        return files;
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
    private async processTestScript( ats: AbstractTestScript, targetDir: string ): Promise< string > {

        await this.ensureDir( targetDir );

        // Prepare file path
        const parsed = path.parse( ats.sourceFile );
        const fileName: string = parsed.name + '.js';
        const filePath: string = path.join( targetDir, fileName );

        // Generate content
        const code: string = this._scriptGenerator.generate( ats );

        // Write content
        await this.writeFile( filePath, code );

        return filePath;
    }

    private async ensureDir( dir: string ): Promise< void > {
        if ( this._fs != fs ) {
            return;
        }
        await fse.mkdirs( dir );
    }

    private async writeFile( path: string, content: string ): Promise< void > {
        const write = promisify( this._fs.writeFile || fs.writeFile );
        await write( path, content, this._encoding );
    }

    /** @inheritDoc */
    public executeCode = async ( options: TestScriptExecutionOptions ): Promise< TestScriptExecutionResult > => {
        return this._scriptExecutor.execute( options )
            .then( this.convertReportFile );
    };

    /** @inheritDoc */
    public convertReportFile = async ( filePath: string ): Promise< TestScriptExecutionResult > => {
        return this._reportConverter.convertFrom( filePath, this.PLUGIN_CONFIG_PATH );
    };

}
