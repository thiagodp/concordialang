import { TestCase } from "concordialang-types/ast";
import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";

/**
 * Detects a TestCase.
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseLexer extends NamedNodeLexer< TestCase > {

    constructor( words: string[] ) {
        super( words, NodeTypes.TEST_CASE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }

}