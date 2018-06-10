import { TestScriptExecutor } from './TestScriptExecutor';
import { TestScriptGenerator } from './TestScriptGenerator';
import { ReportConverter } from './ReportConverter';
import { Plugin } from '../../modules/plugin/Plugin';
import { AbstractTestScript } from '../../modules/testscript/AbstractTestScript';
import { TestScriptGenerationOptions } from '../../modules/testscript/TestScriptOptions';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/testscript/TestScriptExecution';
import { promisify } from 'util';
import { CommandMapper } from './CommandMapper';
import { ConfigMaker } from './ConfigMaker';
import { CODECEPTJS_COMMANDS } from './Commands';
import * as fs from 'fs';
import { join, parse } from 'path';
import * as fse from 'node-fs-extra';

/**
 * Plugin for CodeceptJS.
 */
export class CodeceptJS implements Plugin {

    private readonly _descriptorPath: string;
    private readonly _fs: any;

    /**
     * Constructor
     *
     * @param descriptorPath Path of the plugin descriptor file.
     * @param fsToUse Filesystem object to use. Default is nodejs fs.
     * @param _encoding Encoding to use. Default is 'utf8'.
     */
    constructor(
        descriptorPath?: string,
        fsToUse?: any,
        private _encoding: string = 'utf8'
    ) {
        this._descriptorPath = descriptorPath || join( __dirname, '../', 'codeceptjs.json' );
        this._fs = ! fsToUse ? fs : fsToUse;
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

    /** @inheritDoc */
    public async executeCode( options: TestScriptExecutionOptions ): Promise< TestScriptExecutionResult > {
        const scriptExecutor = this.createTestScriptExecutor( options );
        const path = await scriptExecutor.execute( options );
        return await this.convertReportFile( path );
    }

    /** @inheritDoc */
    public async convertReportFile( filePath: string ): Promise< TestScriptExecutionResult > {
        const reportConverter = new ReportConverter( this._fs, this._encoding );
        return await reportConverter.convertFrom( filePath, this._descriptorPath );
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
        const parsed = parse( ats.sourceFile );
        const fileName: string = parsed.name + '.js';
        const filePath: string = join( targetDir, fileName );

        // Generate content
        const scriptGenerator = this.createTestScriptGenerator();
        const code: string = scriptGenerator.generate( ats );

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

    protected createTestScriptGenerator(): TestScriptGenerator {
        return new TestScriptGenerator(
            new CommandMapper( CODECEPTJS_COMMANDS )
        );
    }

    protected createTestScriptExecutor( options: TestScriptExecutionOptions ): TestScriptExecutor {

        const scriptFileFilter = join( options.sourceCodeDir, '**/*.js' );

        const cfgMaker: ConfigMaker = new ConfigMaker();
        let config = cfgMaker.makeBasicConfig(
            scriptFileFilter,
            options.executionResultDir
        );
        cfgMaker.setWebDriverIOHelper( config );
        cfgMaker.setDbHelper( config );
        cfgMaker.setCmdHelper( config );

        return new TestScriptExecutor( config );
    }

}
