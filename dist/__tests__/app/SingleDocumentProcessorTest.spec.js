"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLPBasedSentenceRecognizer_1 = require("../../modules/nlp/NLPBasedSentenceRecognizer");
const SingleDocumentProcessor_1 = require("../../modules/app/SingleDocumentProcessor");
const Parser_1 = require("../../modules/parser/Parser");
const path_1 = require("path");
const NLPTrainer_1 = require("../../modules/nlp/NLPTrainer");
const Options_1 = require("../../modules/app/Options");
const LanguageContentLoader_1 = require("../../modules/dict/LanguageContentLoader");
const LexerBuilder_1 = require("../../modules/lexer/LexerBuilder");
/**
 * @author Thiago Delgado Pinto
 */
describe('SingleDocumentProcessorTest', () => {
    const LANGUAGE = 'pt';
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    const langLoader = new LanguageContentLoader_1.JsonLanguageContentLoader(options.languageDir, {}, options.encoding);
    let lexer = (new LexerBuilder_1.LexerBuilder(langLoader)).build(options, LANGUAGE);
    let parser = new Parser_1.Parser();
    let nlpTrainer = new NLPTrainer_1.NLPTrainer(langLoader);
    let nlpRec = new NLPBasedSentenceRecognizer_1.NLPBasedSentenceRecognizer(nlpTrainer);
    let singleDocProcessor = new SingleDocumentProcessor_1.SingleDocumentProcessor();
    let analyze = (doc, lexer) => {
        singleDocProcessor.analyzeNodes(doc, lexer, parser, nlpRec, LANGUAGE);
    };
    it('is able to recognize a defined database', () => {
        [
            'Banco de dados: acme',
            '- tipo é "mysql"',
            '- host é "127.0.0.2"',
            '- username é "root"',
            '- password é ""',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        analyze(doc, lexer);
        expect(doc.fileErrors).toHaveLength(0);
        expect(doc.databases).toHaveLength(1);
    });
});
