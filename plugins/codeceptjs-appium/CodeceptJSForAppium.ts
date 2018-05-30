import { CodeceptJS } from "../codeceptjs/CodeceptJS";
import * as path from 'path';
import { TestScriptExecutor } from "../codeceptjs/TestScriptExecutor";
import { APPIUM_COMMANDS } from "./AppiumCommands";
import { TestScriptGenerator } from "../codeceptjs/TestScriptGenerator";
import { CommandMapper } from "../codeceptjs/CommandMapper";
import { ConfigMaker } from "../codeceptjs/ConfigMaker";

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
            path.join( __dirname, '../', 'codeceptjs-appium.json' ),
            fsToUse,
            encoding
        );
    }

    protected createTestScriptGenerator(): TestScriptGenerator {
        return new TestScriptGenerator(
            new CommandMapper( APPIUM_COMMANDS )
        );
    }

    protected createTestScriptExecutor(): TestScriptExecutor {
        const cfgMaker: ConfigMaker = new ConfigMaker();
        const defaultConfig = cfgMaker.makeConfig( cfgMaker.makeAppiumHelperConfig() );
        return new TestScriptExecutor( defaultConfig );
    }

}