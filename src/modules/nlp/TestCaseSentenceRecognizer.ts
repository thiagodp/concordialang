import { NodeSentenceRecognizer, NLPResultProcessor } from "./NodeSentenceRecognizer";
import { UIElementItem } from "../ast/UIElement";
import { LocatedException } from "../req/LocatedException";
import { ContentNode } from "../ast/Node";
import { NLPResult, NLP } from "./NLP";
import { NLPException } from "./NLPException";
import { Entities } from "./Entities";
import { Warning } from "../req/Warning";

/**
 * Test case sentence recognizer.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestCaseSentenceRecognizer {

    constructor( private _nlp: NLP ) {
    }

    /**
     * Recognize sentences of test cases using NLP.
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

        let processor: NLPResultProcessor = function(
            node: ContentNode,
            r: NLPResult,
            errors: LocatedException[],
            warnings: LocatedException[]
        ) {
            /* TO-DO
            const entityNames: string[] = r.entities.map( e => e.entity );
            
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

            // Must have a value
            const valueIndex: number = entityNames.indexOf( Entities.VALUE );
            if ( valueIndex < 0 ) {
                const msg = 'Unrecognized value in the sentence "' + node.content + '".';
                errors.push( new NLPException( msg, node.location ) );
                return;
            }
            const valueContent = r.entities[ valueIndex ].value;            

            // Sets the item
            let item: UIElementItem = node as UIElementItem;
            item.property = propertyContent;
            item.value = valueContent;
            */
        };

        const TARGET_INTENT = 'testcase';
        const TARGET_NAME = 'Test Case';        
        ( new NodeSentenceRecognizer( this._nlp ) ).recognize(
            nodes, TARGET_INTENT, TARGET_NAME, errors, warnings, processor );
    }

}