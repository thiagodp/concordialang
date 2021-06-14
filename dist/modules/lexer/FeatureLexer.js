import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";
/**
 * Detects a Feature.
 *
 * @author Thiago Delgado Pinto
 */
export class FeatureLexer extends NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes.FEATURE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.SCENARIO];
    }
}
