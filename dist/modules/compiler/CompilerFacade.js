"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../error");
const language_1 = require("../language");
const LanguageManager_1 = require("../language/LanguageManager");
const Lexer_1 = require("../lexer/Lexer");
const NLPBasedSentenceRecognizer_1 = require("../nlp/NLPBasedSentenceRecognizer");
const NLPTrainer_1 = require("../nlp/NLPTrainer");
const Parser_1 = require("../parser/Parser");
const TestCaseGeneratorFacade_1 = require("../testcase/TestCaseGeneratorFacade");
const file_1 = require("../util/file");
const ext_changer_1 = require("../util/file/ext-changer");
const FSFileHandler_1 = require("../util/file/FSFileHandler");
const FSFileSearcher_1 = require("../util/file/FSFileSearcher");
const Compiler_1 = require("./Compiler");
const SingleFileCompiler_1 = require("./SingleFileCompiler");
function extractFilesToCompile(files, extensionFeature, extensionTestCase, pathLibrary) {
    const featureFiles = files
        .filter(f => f.endsWith(extensionFeature))
        .map(f => file_1.toUnixPath(f));
    const onlyTestCases = files
        .filter(f => f.endsWith(extensionTestCase))
        .map(f => file_1.toUnixPath(f));
    const testCasesWithoutFeature = onlyTestCases
        .filter(tc => !featureFiles.includes(file_1.toUnixPath(ext_changer_1.changeFileExtension(tc, extensionFeature, pathLibrary))));
    return featureFiles.concat(testCasesWithoutFeature);
}
exports.extractFilesToCompile = extractFilesToCompile;
/**
 * Compiler facade
 *
 * @author Thiago Delgado Pinto
 */
class CompilerFacade {
    constructor(_fs, _path, _compilerListener, _tcGenListener) {
        this._fs = _fs;
        this._path = _path;
        this._compilerListener = _compilerListener;
        this._tcGenListener = _tcGenListener;
    }
    compile(options) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const fileSearcher = new FSFileSearcher_1.FSFileSearcher(this._fs);
            if (this._compilerListener) {
                this._compilerListener.announceFileSearchStarted();
            }
            const files = yield fileSearcher.searchFrom(options);
            // console.log( '>>> FOUND', files );
            const filesToCompile = extractFilesToCompile(files, options.extensionFeature, options.extensionTestCase, this._path);
            const filesToCompileCount = filesToCompile.length;
            if (this._compilerListener) {
                const filesCount = files.length;
                const ignoredCount = files.length - filesToCompileCount;
                const durationMS = Date.now() - startTime;
                this._compilerListener.announceFileSearchFinished(durationMS, filesCount, ignoredCount);
            }
            if (filesToCompileCount < 1) {
                return [null, null];
            }
            const lm = new LanguageManager_1.LanguageManager(fileSearcher, options.languageDir);
            const availableLanguages = yield lm.availableLanguages();
            if (availableLanguages.indexOf(options.language) < 0) { // not found
                throw new error_1.RuntimeException('Informed language is not available: ' + options.language);
            }
            const fileHandler = new FSFileHandler_1.FSFileHandler(this._fs);
            const langLoader = new language_1.JsonLanguageContentLoader(options.languageDir, {}, fileHandler, fileHandler);
            const lexer = new Lexer_1.Lexer(options.language, langLoader);
            const parser = new Parser_1.Parser();
            const nlpTrainer = new NLPTrainer_1.NLPTrainer(langLoader);
            const nlpBasedSentenceRecognizer = new NLPBasedSentenceRecognizer_1.NLPBasedSentenceRecognizer(nlpTrainer);
            const singleFileCompiler = new SingleFileCompiler_1.SingleFileCompiler(lexer, parser, nlpBasedSentenceRecognizer, options.language);
            if (this._compilerListener) {
                this._compilerListener.announceCompilerStarted(options);
            }
            const compiler = new Compiler_1.Compiler(fileHandler, singleFileCompiler, options.lineBreaker);
            const output = yield compiler.compile(filesToCompile, options.directory, { stopOnTheFirstError: options.stopOnTheFirstError });
            // console.log( 'OUT >', output.spec.docs.length, "\n", output.spec.docs.map( d => d.fileInfo.path ) );
            const compiledFilesCount = (_b = (_a = output.spec) === null || _a === void 0 ? void 0 : _a.docs) === null || _b === void 0 ? void 0 : _b.length;
            if (this._compilerListener && compiledFilesCount) {
                const durationMS = Date.now() - startTime;
                const testCasesCount = (_d = (_c = output.spec) === null || _c === void 0 ? void 0 : _c.docs) === null || _d === void 0 ? void 0 : _d.filter(doc => { var _a, _b; return (_b = (_a = doc.fileInfo) === null || _a === void 0 ? void 0 : _a.path) === null || _b === void 0 ? void 0 : _b.endsWith(options.extensionTestCase); }).length;
                const featuresCount = compiledFilesCount - testCasesCount;
                this._compilerListener.announceCompilerFinished(compiledFilesCount, featuresCount, testCasesCount, durationMS);
                this._compilerListener.reportProblems(output.problems, options.directory);
            }
            if (!options.generateTestCase || !output.spec.docs || compiledFilesCount < 1) {
                return [output.spec, output.graph];
            }
            const tcGenCtrl = new TestCaseGeneratorFacade_1.TestCaseGeneratorFacade(nlpBasedSentenceRecognizer.variantSentenceRec, langLoader, this._tcGenListener, fileHandler);
            return yield tcGenCtrl.execute(options, output.spec, output.graph);
        });
    }
}
exports.CompilerFacade = CompilerFacade;
