import { Database } from '../ast/Database';
import { NamedNodeLexer } from "./NamedNodeLexer";
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Database node.
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabaseLexer extends NamedNodeLexer< Database > {

    constructor( words: string[] ) {
        super( words, NodeTypes.DATABASE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.DATABASE ];
    }

}