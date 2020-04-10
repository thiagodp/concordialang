import { Document, Node } from "../ast";
import { ProblemMapper } from "../error/ProblemMapper";
import { Lexer } from "../lexer/Lexer";
import { NLPBasedSentenceRecognizer } from "../nlp/NLPBasedSentenceRecognizer";
import { Parser } from "../parser/Parser";
import { BatchDocumentAnalyzer } from "../semantic2/single/BatchDocumentAnalyzer";

export class SingleFileCompiler {

    private _documentAnalyzer = new BatchDocumentAnalyzer();

    constructor(
        private _lexer: Lexer,
        private _parser: Parser,
        private _nlpRec: NLPBasedSentenceRecognizer,
        private _defaultLanguage: string,
        private _ignoreSemanticAnalysis: boolean = false
    ) {
    }

    /**
     * MUST NEVER THROW
     */
    public async process(
        problems: ProblemMapper,
        filePath: string,
        content: string,
        lineBreaker: string = "\n"
    ): Promise< Document > {
        const lines: string[] = content.split( lineBreaker );
        return this.processLines( problems, filePath, lines );
    }

    /**
     * MUST NEVER THROW
     */
    public async processLines(
        problems: ProblemMapper,
        filePath: string,
        lines: string[]
    ): Promise< Document > {

        lines.forEach( ( line, index ) => this._lexer.addNodeFromLine( line, index + 1 ) );

        let doc: Document = {
            fileInfo: { hash: null, path: filePath }
        };

        this.analyzeNodes( problems, doc );
        return doc;
    }


    /**
     * Analyzes lexer's nodes of a single document.
     */
    analyzeNodes(
        problems: ProblemMapper,
        doc: Document
    ): boolean {

        // Get the lexed nodes
        let nodes: Node[] = this._lexer.nodes();

        // Add errors found
        this.addErrors( problems, this._lexer.errors(), doc );

        // Resets the lexer state (important!)
        this._lexer.reset();

        // PARSER
        this._parser.analyze( nodes, doc );
        this.addErrors( problems, this._parser.errors(), doc );

        // NLP
        let language = doc.language ? doc.language.value : this._defaultLanguage;
        const isTrained: boolean = this._nlpRec.isTrained( language );
        if ( ! isTrained ) {
            if ( this._nlpRec.canBeTrained( language ) ) {
                this._nlpRec.train( language );
            } else {
                let errors = [
                    new Error( 'The NLP cannot be trained in the language "' + language + '".' )
                ];
                this.addErrors( problems, errors, doc );
            }
        }

        const errors: Error[] = [];
        const warnings: Error[] = [];

        this._nlpRec.recognizeSentencesInDocument(
            doc, language, errors, warnings );

        this.addErrors( problems, errors, doc );
        this.addWarnings( problems, warnings, doc );

        // Single-document Semantic Analysis
        if ( ! this._ignoreSemanticAnalysis ) {
            this._documentAnalyzer.analyze( doc, problems );
        }

        return problems.isEmpty();
    }


    private addErrors( mapper: ProblemMapper, errors: Error[], doc: Document ) {
        if ( errors.length > 0 ) {
            mapper.addError( doc.fileInfo.path, ...errors );
        }
    }

    private addWarnings( mapper: ProblemMapper, warnings: Error[], doc: Document ) {
        if ( warnings.length > 0 ) {
            mapper.addWarning( doc.fileInfo.path, ...warnings );
        }
    }

}