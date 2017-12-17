import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";
import { Template } from '../ast/Variant';

/**
 * Detects a Template.
 * 
 * @author Thiago Delgado Pinto
 */
export class TemplateLexer extends NamedNodeLexer< Template > {
    
    constructor( words: string[] ) {
        super( words, NodeTypes.TEMPLATE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }    
}