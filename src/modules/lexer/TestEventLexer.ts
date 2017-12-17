import { TestEventBlock, TestEventItem } from '../ast/TestEvent';
import { NodeTypes } from "../req/NodeTypes";
import { BlockLexer } from './BlockLexer';
import { ListItemLexer } from './ListItemLexer';

/**
 * TestEventItem lexer.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestEventItemLexer extends ListItemLexer< TestEventItem > {

    constructor() {
        super( NodeTypes.TEST_EVENT_ITEM );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TEST_EVENT_ITEM ];
    }
}

/**
 * Detects a BeforeAll.
 * 
 * @author Thiago Delgado Pinto
 */
export class BeforeAllLexer extends BlockLexer< TestEventBlock > {

    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_ALL );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TEST_EVENT_ITEM ];
    }

}

/**
 * Detects an AfterAll.
 * 
 * @author Thiago Delgado Pinto
 */
export class AfterAllLexer extends BlockLexer< TestEventBlock > {

    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_ALL );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TEST_EVENT_ITEM ];
    }

}

/**
 * Detects a BeforeFeature.
 * 
 * @author Thiago Delgado Pinto
 */
export class BeforeFeatureLexer extends BlockLexer< TestEventBlock > {

    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_FEATURE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TEST_EVENT_ITEM ];
    }

}

/**
 * Detects an AfterFeature.
 * 
 * @author Thiago Delgado Pinto
 */
export class AfterFeatureLexer extends BlockLexer< TestEventBlock > {

    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_FEATURE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TEST_EVENT_ITEM ];
    }

}

/**
 * Detects a BeforeScenarios.
 * 
 * @author Thiago Delgado Pinto
 */
export class BeforeScenariosLexer extends BlockLexer< TestEventBlock > {

    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_EACH_SCENARIO );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TEST_EVENT_ITEM ];
    }

}

/**
 * Detects an AfterScenarios.
 * 
 * @author Thiago Delgado Pinto
 */
export class AfterScenariosLexer extends BlockLexer< TestEventBlock > {

    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_EACH_SCENARIO );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TEST_EVENT_ITEM ];
    }
        
}