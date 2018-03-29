import { BlockLexer } from "./BlockLexer";
import { VariantBackground } from "../ast/VariantBackground";
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Variant Background block.
 *
 * @author Thiago Delgado Pinto
 */
export class VariantBackgroundLexer extends BlockLexer< VariantBackground > {

    constructor( words: string[] ) {
        super( words, NodeTypes.VARIANT_BACKGROUND );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN, NodeTypes.SCENARIO, NodeTypes.VARIANT ];
    }

}