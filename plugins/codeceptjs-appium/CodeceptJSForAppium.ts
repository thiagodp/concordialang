import { CodeceptJS } from "../codeceptjs/CodeceptJS";
import { TestScriptExecutor } from "../codeceptjs/TestScriptExecutor";
import { TestScriptGenerator } from "../codeceptjs/TestScriptGenerator";
import { CommandMapper } from "../codeceptjs/CommandMapper";
import { ConfigMaker } from "../codeceptjs/ConfigMaker";
import { TestScriptExecutionOptions } from "../../modules/testscript/TestScriptExecution";
import { join } from 'path';

/**
 * Plug-in for CodeceptJS with Appium.
 */
export class CodeceptJSForAppium extends CodeceptJS {

    /**
     * Constructor
     *
     * @param fsToUse Filesystem object to use. Default is nodejs fs.
     * @param encoding Encoding to use. Default is 'utf8'.
     */
    constructor(
        fsToUse?: any,
        encoding: string = 'utf8'
    ) {
        super(
            join( __dirname, '../', 'codeceptjs-appium.json' ),
            fsToUse,
            encoding
        );
    }

    protected createTestScriptExecutor( options: TestScriptExecutionOptions ): TestScriptExecutor {

        const scriptFileFilter = join( options.sourceCodeDir, '**/*.js' );

        const cfgMaker: ConfigMaker = new ConfigMaker();
        let config = cfgMaker.makeBasicConfig(
            scriptFileFilter,
            options.executionResultDir
        );
        cfgMaker.setAppiumHelper( config );
        cfgMaker.setDbHelper( config );
        cfgMaker.setCmdHelper( config );

        return new TestScriptExecutor( config );
    }

}