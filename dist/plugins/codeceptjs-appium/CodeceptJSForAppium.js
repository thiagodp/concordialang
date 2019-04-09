"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const CodeceptJS_1 = require("../codeceptjs/CodeceptJS");
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
        super(path_1.join(__dirname, '../', 'codeceptjs-appium.json'), fsToUse, encoding);
    }
    createTestScriptExecutor(options) {
        const scriptFileFilter = path_1.join(options.sourceCodeDir, '**/*.js');
        const cfgMaker = new ConfigMaker_1.ConfigMaker();
        let config = cfgMaker.makeBasicConfig(scriptFileFilter, options.executionResultDir);
        cfgMaker.setAppiumHelper(config);
        cfgMaker.setDbHelper(config);
        cfgMaker.setCmdHelper(config);
        return new TestScriptExecutor_1.TestScriptExecutor(config);
    }
}
exports.CodeceptJSForAppium = CodeceptJSForAppium;
