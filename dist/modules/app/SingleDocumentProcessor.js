"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BatchDocumentAnalyzer_1 = require("../semantic/single/BatchDocumentAnalyzer");
/**
 * Single document processor.
 *
 * @author Thiago Delgado Pinto
 */
class SingleDocumentProcessor {
    constructor() {
        this._documentAnalyzer = new BatchDocumentAnalyzer_1.BatchDocumentAnalyzer();
    }
    /**
     * Analyzes lexer's nodes of a single document.
     * Errors and warnings are put in the given document.
     *
     * @param doc Document to change
     * @param lexer Lexer
     * @param parser Parser
     * @param nlpRec NLP sentence recognizer
     * @param defaultLanguage Default language
     * @param ignoreSemanticAnalysis If it is desired to ignore semantic analysis (defaults to false).
     *
     * @returns true if had errors.
     */
    analyzeNodes(doc, lexer, parser, nlpRec, defaultLanguage, ignoreSemanticAnalysis = false) {
        // Get the lexed nodes
        let nodes = lexer.nodes();
        // Add errors found
        this.addErrorsToDoc(lexer.errors(), doc);
        // Resets the lexer state (important!)
        lexer.reset();
        // PARSER
        parser.analyze(nodes, doc);
        this.addErrorsToDoc(parser.errors(), doc);
        // NLP
        let language = doc.language ? doc.language.value : defaultLanguage;
        const isTrained = nlpRec.isTrained(language);
        if (!isTrained) {
            if (nlpRec.canBeTrained(language)) {
                nlpRec.train(language);
            }
            else {
                let errors = [
                    new Error('The NLP cannot be trained in the language "' + language + '".')
                ];
                this.addErrorsToDoc(errors, doc);
            }
        }
        if (!doc.fileWarnings) {
            doc.fileWarnings = [];
        }
        nlpRec.recognizeSentencesInDocument(doc, language, doc.fileErrors, doc.fileWarnings);
        // Single-document Semantic Analysis
        if (!ignoreSemanticAnalysis) {
            let semanticErrors = [];
            this._documentAnalyzer.analyze(doc, semanticErrors);
            this.addErrorsToDoc(semanticErrors, doc);
        }
        return doc.fileErrors.length > 0;
    }
    addErrorsToDoc(errors, doc) {
        if (!doc.fileErrors) {
            doc.fileErrors = [];
        }
        doc.fileErrors.push.apply(doc.fileErrors, errors);
    }
}
exports.SingleDocumentProcessor = SingleDocumentProcessor;
