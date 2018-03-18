import { NLPBasedSentenceRecognizer } from '../nlp/NLPBasedSentenceRecognizer';
import { Parser } from '../parser/Parser';
import { Lexer } from "../lexer/Lexer";
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { BatchDocumentAnalyzer } from '../semantic/single/BatchDocumentAnalyzer';
import { SemanticException } from '../semantic/SemanticException';

/**
 * Single document processor.
 *
 * @author Thiago Delgado Pinto
 */
export class SingleDocumentProcessor {

    private _documentAnalyzer = new BatchDocumentAnalyzer();

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
    analyzeNodes(
        doc: Document,
        lexer: Lexer,
        parser: Parser,
        nlpRec: NLPBasedSentenceRecognizer,
        defaultLanguage: string,
        ignoreSemanticAnalysis: boolean = false
    ): boolean {

        // Get the lexed nodes
        let nodes: Node[] = lexer.nodes();

        // Add errors found
        this.addErrorsToDoc( lexer.errors(), doc );

        // Resets the lexer state (important!)
        lexer.reset();

        // PARSER
        parser.analyze( nodes, doc );
        this.addErrorsToDoc( parser.errors(), doc );

        // NLP
        let language = doc.language ? doc.language.value : defaultLanguage;
        const isTrained: boolean = nlpRec.isTrained( language );
        if ( ! isTrained ) {
            if ( nlpRec.canBeTrained( language ) ) {
                nlpRec.train( language );
            } else {
                let errors = [
                    new Error( 'The NLP cannot be trained in the language "' + language + '".' )
                ];
                this.addErrorsToDoc( errors, doc );
            }
        }

        if ( ! doc.fileWarnings ) {
            doc.fileWarnings = [];
        }

        nlpRec.recognizeSentencesInDocument(
            doc, language, doc.fileErrors, doc.fileWarnings );

        // Single-document Semantic Analysis
        if ( ! ignoreSemanticAnalysis ) {
            let semanticErrors: SemanticException[] = [];
            this._documentAnalyzer.analyze( doc, semanticErrors );
            this.addErrorsToDoc( semanticErrors, doc );
        }

        return doc.fileErrors.length > 0;
    }


    private addErrorsToDoc( errors: Error[], doc: Document ) {
        if ( ! doc.fileErrors ) {
            doc.fileErrors = [];
        }
        doc.fileErrors.push.apply( doc.fileErrors, errors );
    }
}