import { RuntimeException } from "../error";
import { BatchDocumentAnalyzer } from "../semantic/single/BatchDocumentAnalyzer";
export class SingleFileCompiler {
    constructor(_lexer, _parser, _nlpRec, _defaultLanguage, _ignoreSemanticAnalysis = false) {
        this._lexer = _lexer;
        this._parser = _parser;
        this._nlpRec = _nlpRec;
        this._defaultLanguage = _defaultLanguage;
        this._ignoreSemanticAnalysis = _ignoreSemanticAnalysis;
        this._documentAnalyzer = new BatchDocumentAnalyzer();
    }
    /**
     * MUST NEVER THROW
     */
    async process(problems, filePath, content, lineBreaker = "\n") {
        const lines = content.split(lineBreaker);
        return this.processLines(problems, filePath, lines);
    }
    /**
     * MUST NEVER THROW
     */
    async processLines(problems, filePath, lines) {
        lines.forEach((line, index) => this._lexer.addNodeFromLine(line, index + 1));
        let doc = {
            fileInfo: { hash: null, path: filePath }
        };
        this.analyzeNodes(problems, doc);
        return doc;
    }
    /**
     * Analyze nodes recognized by a lexer for a given document.
     */
    analyzeNodes(problems, doc) {
        // Get recognized nodes
        let nodes = this._lexer.nodes();
        // Add errors found
        this.addErrors(problems, this._lexer.errors(), doc);
        // Resets the lexer state (important!)
        this._lexer.reset();
        // PARSER
        this._parser.analyze(nodes, doc);
        this.addErrors(problems, this._parser.errors(), doc);
        // NLP
        let language = doc.language ? doc.language.value : this._defaultLanguage;
        const isTrained = this._nlpRec.isTrained(language);
        if (!isTrained) {
            if (this._nlpRec.canBeTrained(language)) {
                this._nlpRec.train(language);
            }
            else {
                let errors = [
                    new RuntimeException('The NLP cannot be trained in the language "' + language + '".')
                ];
                this.addErrors(problems, errors, doc);
            }
        }
        const errors = [];
        const warnings = [];
        this._nlpRec.recognizeSentencesInDocument(doc, language, errors, warnings);
        this.addErrors(problems, errors, doc);
        this.addWarnings(problems, warnings, doc);
        // Single-document Semantic Analysis
        if (!this._ignoreSemanticAnalysis) {
            this._documentAnalyzer.analyze(doc, problems);
        }
        return problems.isEmpty();
    }
    addErrors(mapper, errors, doc) {
        for (const e of errors) {
            let re;
            if (e.name === Error.name) {
                re = RuntimeException.createFrom(e);
            }
            else {
                re = e;
            }
            mapper.addError(doc.fileInfo.path, re);
        }
    }
    addWarnings(mapper, warnings, doc) {
        if (warnings.length > 0) {
            mapper.addWarning(doc.fileInfo.path, ...warnings);
        }
    }
}
