import * as console from 'console';
import { ContentNode } from "../ast/Node";
import { NLP, NLPResult } from './NLP';
import { LocatedException } from "../req/LocatedException";
import { NLPException } from "./NLPException";

/**
 * NLP result processor
 * 
 * @author Thiago Delgado Pinto
 */
export type NLPResultProcessor = (
    node: ContentNode,
    result: NLPResult,
    errors: LocatedException[],
    warnings: LocatedException[]
) => void;

/**
 * Node sentence recognizer
 * 
 * @author Thiago Delgado Pinto
 */
export class NodeSentenceRecognizer {

    constructor( private _nlp: NLP ) {
    }

    /**
     * Tries to recognize the sentences of the given nodes.
     * 
     * @param nodes Nodes with content to be analyzed.
     * @param targetIntent Target intent, to be used by the NLP.
     * @param targetDisplayName Target name to be displayed to the user in case of error.
     * @param errors Output errors.
     * @param warnings Output warnings.
     * @param resultProcessor Function to process each result.
     * 
     * @throws Error If the NLP is not trained.
     */
    public recognize(
        nodes: ContentNode[],
        targetIntent: string,
        targetDisplayName: string,
        errors: LocatedException[],
        warnings: LocatedException[],
        resultProcessor: NLPResultProcessor
    ): void {

        if ( ! this._nlp.isTrained() ) {
            throw new Error( 'A trained NLP is required.' );
        }

        for ( let node of nodes ) {
            let r: NLPResult = this._nlp.recognize( node.content, targetIntent );

            // Not recognized?
            if ( ! r ) {
                let msg = 'Unrecognized sentence: "' + node.content + '".';
                errors.push( new NLPException( msg, node.location ) );
                continue;
            }
            // Different intent?
            if ( targetIntent != r.intent ) {
                let msg = 'Sentence not recognized as part of a ' + targetDisplayName + ': "' + node.content + '".';
                errors.push( new NLPException( msg, node.location ) );
                continue;
            }
            // Process the result
            resultProcessor( node, r, errors, warnings );
        }
    }

}