import { Intents } from './Intents';
import { NodeSentenceRecognizer, NLPResultProcessor } from "./NodeSentenceRecognizer";
import { UIElementItem } from "../ast/UIElement";
import { LocatedException } from "../req/LocatedException";
import { ContentNode } from "../ast/Node";
import { NLPResult, NLP } from "./NLP";
import { NLPException } from "./NLPException";
import { Entities } from "./Entities";
import { Warning } from "../req/Warning";

/**
 * UI element item sentence recognizer.
 * 
 * @author Thiago Delgado Pinto
 */
export class UIElementItemRecognizer {

    constructor( private _nlp: NLP ) {
    }    

    /**
     * Recognize sentences of UI Elements using NLP.
     * 
     * @param nodes Nodes to be recognized.
     * @param errors Output errors.
     * @param warnings Output warnings.
     * 
     * @throws Error If the NLP is not trained.
     */
    recognizeSentences(
        nodes: UIElementItem[],
        errors: LocatedException[],
        warnings: LocatedException[]        
    ) {
        //console.log( nodes );

        let processor: NLPResultProcessor = function(
            node: ContentNode,
            r: NLPResult,
            errors: LocatedException[],
            warnings: LocatedException[]
        ) {
            
            const entityNames: string[] = r.entities.map( e => e.entity );
            //console.log( r );
            
            // Must have a property
            const propertyIndex: number = entityNames.indexOf( Entities.UI_PROPERTY );
            if ( propertyIndex < 0 ) {
                const msg = 'Unrecognized property in the sentence "' + node.content + '".';
                errors.push( new NLPException( msg, node.location ) );
                return;
            }
            const propertyContent = r.entities[ propertyIndex ].value;

            // Its is recommended to have a verb
            const verbIndex: number = entityNames.indexOf( Entities.UI_VERB );
            if ( verbIndex < 0 ) {
                const msg = 'Unrecognized verb in the sentence "' + node.content + '".';
                warnings.push( new Warning( msg, node.location ) );
            }

            // Verify allowed entities
            const allowedEntities = [
                Entities.VALUE,
                Entities.NUMBER,
                Entities.ELEMENT,
                Entities.SCRIPT
            ];
            let values = [];
            for ( let allowed of allowedEntities ) {
                // Capture all values
                let entityIndex = -1;
                do {
                    entityIndex = entityNames.indexOf( allowed, entityIndex + 1 );
                    if ( entityIndex >= 0 ) {
                        values.push( r.entities[ entityIndex ].value );
                    }
                } while ( entityIndex >= 0 );
            }
            // Not found?
            if ( values.length < 1 ) {
                let msg = 'Unrecognized value in the sentence "' + node.content + '".';
                errors.push( new NLPException( msg, node.location ) );
                return;
            }
            // Found, then changes the node with the recognized content
            let item: UIElementItem = node as UIElementItem;
            item.property = propertyContent;
            item.values = values;
        };

        const TARGET_INTENT = Intents.UI;
        const TARGET_NAME = 'UI Element';        
        ( new NodeSentenceRecognizer( this._nlp ) ).recognize(
            nodes, TARGET_INTENT, TARGET_NAME, errors, warnings, processor );
    }

}