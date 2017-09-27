import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepThen } from "../ast/Step";
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Then node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepThenLexer extends StartingKeywordLexer< StepThen > {

    constructor( words: string[] ) {
        super( words, NodeTypes.STEP_THEN );
    }

}