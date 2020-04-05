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
const Compiler2_1 = require("../compiler/Compiler2");
const FileCompiler_1 = require("../compiler/FileCompiler");
const MultiFileProcessor2_1 = require("../compiler/MultiFileProcessor2");
const dict_1 = require("../dict");
const LexerBuilder_1 = require("../lexer/LexerBuilder");
const NLPBasedSentenceRecognizer_1 = require("../nlp/NLPBasedSentenceRecognizer");
const NLPTrainer_1 = require("../nlp/NLPTrainer");
const Parser_1 = require("../parser/Parser");
const BatchSpecificationAnalyzer_1 = require("../semantic/BatchSpecificationAnalyzer");
const FSFileReader_1 = require("../util/file/FSFileReader");
const FSFileSearcher_1 = require("../util/file/FSFileSearcher");
const LanguageManager_1 = require("./LanguageManager");
const SimpleAppEventsListener_1 = require("./SimpleAppEventsListener");
const SingleFileCompiler_1 = require("./SingleFileCompiler");
const TCGenController_1 = require("./TCGenController");
const VerboseAppEventsListener_1 = require("./VerboseAppEventsListener");
/**
 * Compiler controller
 *
 * @author Thiago Delgado Pinto
 */
class CompilerController {
    constructor(_fs) {
        this._fs = _fs;
    }
    compile(options, cli) {
        return __awaiter(this, void 0, void 0, function* () {
            const langLoader = new dict_1.JsonLanguageContentLoader(options.languageDir, {}, options.encoding);
            let lexer = (new LexerBuilder_1.LexerBuilder(langLoader)).build(options, options.language);
            let parser = new Parser_1.Parser();
            let nlpTrainer = new NLPTrainer_1.NLPTrainer(langLoader);
            let nlpBasedSentenceRecognizer = new NLPBasedSentenceRecognizer_1.NLPBasedSentenceRecognizer(nlpTrainer);
            let specAnalyzer = new BatchSpecificationAnalyzer_1.BatchSpecificationAnalyzer();
            const lm = new LanguageManager_1.LanguageManager(options.languageDir);
            const availableLanguages = yield lm.availableLanguages();
            if (availableLanguages.indexOf(options.language) < 0) { // not found
                throw new Error('Informed language is not available: ' + options.language);
            }
            // Verbose output option
            let listener = options.verbose
                ? new VerboseAppEventsListener_1.VerboseAppEventsListener(cli, options.debug)
                : new SimpleAppEventsListener_1.SimpleAppEventsListener(cli, options.debug);
            let singleFileCompiler = new SingleFileCompiler_1.SingleFileCompiler(lexer, parser, nlpBasedSentenceRecognizer, options.language);
            // let mfp = new MultiFileProcessor( singleFileCompiler, listener, listener, listener, listener );
            // let compiler = new Compiler(
            //     mfp,
            //     specAnalyzer
            // );
            const fileReader = new FSFileReader_1.FSFileReader(this._fs);
            const fileCompiler = new FileCompiler_1.FileCompiler(fileReader, singleFileCompiler, options.lineBreaker);
            const mfp = new MultiFileProcessor2_1.MultiFileProcessor(fileCompiler);
            const fileSearcher = new FSFileSearcher_1.FSFileSearcher(this._fs);
            const compiler = new Compiler2_1.Compiler(fileSearcher, mfp, specAnalyzer);
            let [spec, graph] = yield compiler.compile(options, listener);
            if (!options.generateTestCase || !spec.docs || spec.docs.length < 1) {
                return [spec, graph];
            }
            const tcGenCtrl = new TCGenController_1.TCGenController(listener);
            return yield tcGenCtrl.execute(nlpBasedSentenceRecognizer.variantSentenceRec, langLoader, options, spec, graph);
        });
    }
}
exports.CompilerController = CompilerController;
