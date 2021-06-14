import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";
/**
 * Detects a Database node.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseLexer extends NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes.DATABASE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.DATABASE];
    }
}
