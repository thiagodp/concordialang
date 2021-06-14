import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";
/**
 * Detects a Table.
 *
 * @author Thiago Delgado Pinto
 */
export class TableLexer extends NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes.TABLE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.TABLE_ROW];
    }
}
