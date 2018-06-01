"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Options_1 = require("../app/Options");
const LanguageContentLoader_1 = require("../dict/LanguageContentLoader");
const LexerBuilder_1 = require("../lexer/LexerBuilder");
const Parser_1 = require("../parser/Parser");
const NLPTrainer_1 = require("../nlp/NLPTrainer");
const NLPBasedSentenceRecognizer_1 = require("../nlp/NLPBasedSentenceRecognizer");
const SingleDocumentProcessor_1 = require("../app/SingleDocumentProcessor");
const path_1 = require("path");
/**
 * Useful for testing purposes.
 */
class SimpleCompiler {
    constructor(language = 'pt') {
        this.language = language;
        this.options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
        this.langLoader = new LanguageContentLoader_1.JsonLanguageContentLoader(this.options.languageDir, {}, this.options.encoding);
        this.lexer = (new LexerBuilder_1.LexerBuilder(this.langLoader)).build(this.options, this.language);
        this.parser = new Parser_1.Parser();
        this.nlpTrainer = new NLPTrainer_1.NLPTrainer(this.langLoader);
        this.nlpRec = new NLPBasedSentenceRecognizer_1.NLPBasedSentenceRecognizer(this.nlpTrainer);
        this.singleDocProcessor = new SingleDocumentProcessor_1.SingleDocumentProcessor();
    }
    addToSpec(spec, lines, fileInfo) {
        lines.forEach((val, index) => this.lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        doc.fileInfo = fileInfo;
        let language = this.language;
        if (doc.language) {
            language = doc.language.value;
        }
        this.singleDocProcessor.analyzeNodes(doc, this.lexer, this.parser, this.nlpRec, language);
        spec.docs.push(doc);
        return doc;
    }
}
exports.SimpleCompiler = SimpleCompiler;
