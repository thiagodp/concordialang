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

            // Must have a value or a number
            const valueIndex: number = entityNames.indexOf( Entities.VALUE );
            const numberIndex: number = entityNames.indexOf( Entities.NUMBER );

            let contentIndex: number = -1;
            let msg;
            if ( valueIndex < 0 ) {
                msg = 'Unrecognized value in the sentence "' + node.content + '".';
            } else {
                contentIndex = valueIndex;
            }
            if ( numberIndex < 0 ) {
                msg = 'Unrecognized number in the sentence "' + node.content + '".';
            } else {
                contentIndex = numberIndex;
            }

            if ( valueIndex < 0 && numberIndex < 0 ) {
                errors.push( new NLPException( msg, node.location ) );
                return;                             
            }
            const valueContent = r.entities[ contentIndex ].value

            // Sets the item
            let item: UIElementItem = node as UIElementItem;
            item.property = propertyContent;
            item.value = valueContent;
        };

        const TARGET_INTENT = 'ui';
        const TARGET_NAME = 'UI Element';        
        ( new NodeSentenceRecognizer( this._nlp ) ).recognize(
            nodes, TARGET_INTENT, TARGET_NAME, errors, warnings, processor );
    }

}