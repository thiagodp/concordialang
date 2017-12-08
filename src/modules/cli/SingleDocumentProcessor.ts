import { NLPBasedSentenceRecognizer } from '../nlp/NLPBasedSentenceRecognizer';
import { Parser } from '../parser/Parser';
import { Lexer } from "../lexer/Lexer";
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';

/**
 * Single document processor.
 * 
 * @author Thiago Delgado Pinto
 */
export class SingleDocumentProcessor {

    /**
     * Analyzes lexed nodes of a single document.
     * 
     * @param doc Document to change
     * @param lexer Lexer
     * @param parser Parser
     * @param nlpRec NLP sentence recognizer
     * @param defaultLanguage Default language
     * 
     * @returns true if had errors.
     */
    analyzeLexedNodes(
        doc: Document,
        lexer: Lexer,
        parser: Parser,
        nlpRec: NLPBasedSentenceRecognizer,
        defaultLanguage: string
    ): boolean {

        let hadErrors = false;

        // Get the lexed nodes
        let nodes: Node[] = lexer.nodes();

        // Add errors found
        hadErrors = lexer.hasErrors();            
        this.addErrorsToDoc( lexer.errors(), doc );

        // Resets the lexer state (important!)
        lexer.reset();

        // PARSER
        parser.analyze( nodes, doc );
        hadErrors = hadErrors || parser.hasErrors();
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

        nlpRec.recognizeSentencesInDocument(
            doc, doc.fileErrors, doc.fileWarnings );

        return hadErrors;
    }


    private addErrorsToDoc( errors: Error[], doc: Document ) {
        if ( ! doc.fileErrors ) {
            doc.fileErrors = [];
        }
        doc.fileErrors.push.apply( doc.fileErrors, errors );        
    }    
}