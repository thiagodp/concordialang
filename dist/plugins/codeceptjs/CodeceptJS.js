"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const fse = require("node-fs-extra");
const TestScriptExecutor_1 = require("./TestScriptExecutor");
const TestScriptGenerator_1 = require("./TestScriptGenerator");
const ReportConverter_1 = require("./ReportConverter");
const CommandMapper_1 = require("./CommandMapper");
const ConfigMaker_1 = require("./ConfigMaker");
const Commands_1 = require("./Commands");
/**
 * Plugin for CodeceptJS.
 */
class CodeceptJS {
    /**
     * Constructor
     *
     * @param descriptorPath Path of the plugin descriptor file.
     * @param fsToUse Filesystem object to use. Default is nodejs fs.
     * @param _encoding Encoding to use. Default is 'utf8'.
     */
    constructor(descriptorPath, fsToUse, _encoding = 'utf8') {
        this._encoding = _encoding;
        this._descriptorPath = descriptorPath || path_1.join(__dirname, '../', 'codeceptjs.json');
        this._fs = !fsToUse ? fs : fsToUse;
    }
    /** @inheritDoc */
    generateCode(abstractTestScripts, options, errors) {
        return __awaiter(this, void 0, void 0, function* () {
            let files = [];
            for (let ats of abstractTestScripts || []) {
                try {
                    let file = yield this.processTestScript(ats, options.sourceCodeDir);
                    files.push(file);
                }
                catch (e) {
                    const msg = 'Error generating script for "' + ats.sourceFile + '": ' + e.message;
                    errors.push(new Error(msg));
                }
            }
            return files;
        });
    }
    /** @inheritDoc */
    executeCode(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const scriptExecutor = this.createTestScriptExecutor(options);
            const path = yield scriptExecutor.execute(options);
            return yield this.convertReportFile(path);
        });
    }
    /** @inheritDoc */
    convertReportFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const reportConverter = new ReportConverter_1.ReportConverter(this._fs, this._encoding);
            return yield reportConverter.convertFrom(filePath, this._descriptorPath);
        });
    }
    /** @inheritDoc */
    defaultReportFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return 'output.json';
        });
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
    processTestScript(ats, targetDir) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureDir(targetDir);
            // Prepare file path
            const parsed = path_1.parse(ats.sourceFile);
            const fileName = parsed.name + '.js';
            const filePath = path_1.join(targetDir, fileName);
            // Generate content
            const scriptGenerator = this.createTestScriptGenerator();
            const code = scriptGenerator.generate(ats);
            // Write content
            yield this.writeFile(filePath, code);
            return filePath;
        });
    }
    ensureDir(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._fs != fs) {
                return;
            }
            yield fse.mkdirs(dir);
        });
    }
    writeFile(path, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const write = util_1.promisify(this._fs.writeFile || fs.writeFile);
            yield write(path, content, this._encoding);
        });
    }
    createTestScriptGenerator() {
        return new TestScriptGenerator_1.TestScriptGenerator(new CommandMapper_1.CommandMapper(Commands_1.CODECEPTJS_COMMANDS));
    }
    createTestScriptExecutor(options) {
        const scriptFileFilter = path_1.join(options.sourceCodeDir, '**/*.js');
        const cfgMaker = new ConfigMaker_1.ConfigMaker();
        let config = cfgMaker.makeBasicConfig(scriptFileFilter, options.executionResultDir);
        cfgMaker.setWebDriverIOHelper(config);
        cfgMaker.setDbHelper(config);
        cfgMaker.setCmdHelper(config);
        return new TestScriptExecutor_1.TestScriptExecutor(config);
    }
}
exports.CodeceptJS = CodeceptJS;
