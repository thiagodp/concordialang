import { Variant } from 'concordialang-types';
import { NodeTypes } from "../req/NodeTypes";
import { NamePlusNumberNodeLexer } from "./NamePlusNumberNodeLexer";

/**
 * Detects a Variant.
 *
 * @author Thiago Delgado Pinto
 */
export class VariantLexer extends NamePlusNumberNodeLexer< Variant > {

    constructor( words: string[] ) {
        super( words, NodeTypes.VARIANT );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }
}