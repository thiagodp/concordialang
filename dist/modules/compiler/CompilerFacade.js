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
const TCGenController_1 = require("../app/TCGenController");
const error_1 = require("../error");
const language_1 = require("../language");
const LanguageManager_1 = require("../language/LanguageManager");
const Lexer_1 = require("../lexer/Lexer");
const NLPBasedSentenceRecognizer_1 = require("../nlp/NLPBasedSentenceRecognizer");
const NLPTrainer_1 = require("../nlp/NLPTrainer");
const Parser_1 = require("../parser/Parser");
const FSFileHandler_1 = require("../util/file/FSFileHandler");
const FSFileSearcher_1 = require("../util/file/FSFileSearcher");
const Compiler_1 = require("./Compiler");
const SingleFileCompiler_1 = require("./SingleFileCompiler");
/**
 * Compiler facade
 *
 * @author Thiago Delgado Pinto
 */
class CompilerFacade {
    constructor(_fs, _compilerListener, _tcGenListener) {
        this._fs = _fs;
        this._compilerListener = _compilerListener;
        this._tcGenListener = _tcGenListener;
    }
    compile(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const fileHandler = new FSFileHandler_1.FSFileHandler(this._fs);
            const fileSearcher = new FSFileSearcher_1.FSFileSearcher(this._fs);
            const langLoader = new language_1.JsonLanguageContentLoader(options.languageDir, {}, fileHandler, fileHandler);
            let lexer = new Lexer_1.Lexer(options.language, langLoader);
            let parser = new Parser_1.Parser();
            let nlpTrainer = new NLPTrainer_1.NLPTrainer(langLoader);
            let nlpBasedSentenceRecognizer = new NLPBasedSentenceRecognizer_1.NLPBasedSentenceRecognizer(nlpTrainer);
            const lm = new LanguageManager_1.LanguageManager(fileSearcher, options.languageDir);
            const availableLanguages = yield lm.availableLanguages();
            if (availableLanguages.indexOf(options.language) < 0) { // not found
                throw new error_1.RuntimeException('Informed language is not available: ' + options.language);
            }
            let singleFileCompiler = new SingleFileCompiler_1.SingleFileCompiler(lexer, parser, nlpBasedSentenceRecognizer, options.language);
            // let mfp = new MultiFileProcessor( singleFileCompiler, listener, listener, listener, listener );
            // let compiler = new Compiler(
            //     mfp,
            //     specAnalyzer
            // );
            const files = yield fileSearcher.searchFrom(options);
            // console.log( '>>> FOUND', files );
            if (this._compilerListener) {
                this._compilerListener.compilerStarted(options);
            }
            const compiler = new Compiler_1.Compiler(fileHandler, singleFileCompiler, options.lineBreaker);
            // console.log( 'IN >', files.length, "\n", files );
            const output = yield compiler.compile(files, options.directory, { stopOnTheFirstError: options.stopOnTheFirstError });
            // console.log( 'OUT >', output.spec.docs.length, "\n", output.spec.docs.map( d => d.fileInfo.path ) );
            if (this._compilerListener) {
                const durationMS = Date.now() - startTime;
                this._compilerListener.compilationFinished(durationMS);
                this._compilerListener.reportProblems(output.problems, options.directory);
            }
            if (!options.generateTestCase || !output.spec.docs || output.spec.docs.length < 1) {
                return [output.spec, output.graph];
            }
            const tcGenCtrl = new TCGenController_1.TCGenController(nlpBasedSentenceRecognizer.variantSentenceRec, langLoader, this._tcGenListener, fileHandler);
            return yield tcGenCtrl.execute(options, output.spec, output.graph);
        });
    }
}
exports.CompilerFacade = CompilerFacade;
