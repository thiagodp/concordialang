import { Database } from '../ast/Database';
import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";

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