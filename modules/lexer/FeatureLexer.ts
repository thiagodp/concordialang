import { Feature } from "concordialang-types/ast";
import { NamedNodeLexer } from "./NamedNodeLexer";
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Feature.
 *
 * @author Thiago Delgado Pinto
 */
export class FeatureLexer extends NamedNodeLexer< Feature > {

    constructor( words: Array< string > ) {
        super( words, NodeTypes.FEATURE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.SCENARIO ];
    }

}