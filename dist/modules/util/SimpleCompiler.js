"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path_1 = require("path");
const Options_1 = require("../app/Options");
const SingleDocumentProcessor_1 = require("../app/SingleDocumentProcessor");
const dict_1 = require("../dict");
const Lexer_1 = require("../lexer/Lexer");
const NLPBasedSentenceRecognizer_1 = require("../nlp/NLPBasedSentenceRecognizer");
const NLPTrainer_1 = require("../nlp/NLPTrainer");
const Parser_1 = require("../parser/Parser");
const FSFileHandler_1 = require("./file/FSFileHandler");
/**
 * Useful for testing purposes.
 */
class SimpleCompiler {
    constructor(language = 'pt') {
        this.language = language;
        this.options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
        this.fileHandler = new FSFileHandler_1.FSFileHandler(fs, this.options.encoding);
        this.langLoader = new dict_1.JsonLanguageContentLoader(this.options.languageDir, {}, this.fileHandler, this.fileHandler);
        this.lexer = new Lexer_1.Lexer(this.language, this.langLoader);
        this.parser = new Parser_1.Parser();
        this.nlpTrainer = new NLPTrainer_1.NLPTrainer(this.langLoader);
        this.nlpRec = new NLPBasedSentenceRecognizer_1.NLPBasedSentenceRecognizer(this.nlpTrainer);
        this.singleDocProcessor = new SingleDocumentProcessor_1.SingleDocumentProcessor();
    }
    addToSpec(spec, lines, fileInfo) {
        lines.forEach((val, index) => this.lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        doc.fileInfo = fileInfo || {};
        let language = this.language;
        if (doc.language) {
            language = doc.language.value;
        }
        this.singleDocProcessor.analyzeNodes(doc, this.lexer, this.parser, this.nlpRec, language);
        spec.addDocument(doc);
        return doc;
    }
}
exports.SimpleCompiler = SimpleCompiler;
