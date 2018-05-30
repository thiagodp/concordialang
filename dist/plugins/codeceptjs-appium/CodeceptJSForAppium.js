"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CodeceptJS_1 = require("../codeceptjs/CodeceptJS");
const path = require("path");
const TestScriptExecutor_1 = require("../codeceptjs/TestScriptExecutor");
const ConfigMaker_1 = require("../codeceptjs/ConfigMaker");
/**
 * Plug-in for CodeceptJS with Appium.
 */
class CodeceptJSForAppium extends CodeceptJS_1.CodeceptJS {
    /**
     * Constructor
     *
     * @param fsToUse Filesystem object to use. Default is nodejs fs.
     * @param encoding Encoding to use. Default is 'utf8'.
     */
    constructor(fsToUse, encoding = 'utf8') {
        super(path.join(__dirname, '../', 'codeceptjs-appium.json'), fsToUse, encoding);
    }
    createTestScriptExecutor() {
        const cfgMaker = new ConfigMaker_1.ConfigMaker();
        const defaultConfig = cfgMaker.makeConfig(cfgMaker.makeAppiumHelperConfig());
        return new TestScriptExecutor_1.TestScriptExecutor(defaultConfig);
    }
}
exports.CodeceptJSForAppium = CodeceptJSForAppium;
