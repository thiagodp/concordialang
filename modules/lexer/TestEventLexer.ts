import {
    AfterAll,
    AfterEachScenario,
    AfterFeature,
    BeforeAll,
    BeforeEachScenario,
    BeforeFeature
} from '../ast';
import { NodeTypes } from '../req/NodeTypes';
import { BlockLexer } from './BlockLexer';


export class BeforeAllLexer extends BlockLexer< BeforeAll > {

    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_ALL );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }

}


export class AfterAllLexer extends BlockLexer< AfterAll > {

    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_ALL );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }

}


export class BeforeFeatureLexer extends BlockLexer< BeforeFeature > {

    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_FEATURE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }

}

export class AfterFeatureLexer extends BlockLexer< AfterFeature > {

    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_FEATURE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }

}


export class BeforeEachScenarioLexer extends BlockLexer< BeforeEachScenario > {

    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_EACH_SCENARIO );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }

}

export class AfterEachScenarioLexer extends BlockLexer< AfterEachScenario > {

    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_EACH_SCENARIO );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN ];
    }

}
