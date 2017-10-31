import { TestEventBlock, TestEventItem } from '../ast/TestEvent';
import { NodeTypes } from "../req/NodeTypes";
import { KeywordBlockLexer } from './KeywordBlockLexer';
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
}

/**
 * Detects a BeforeAll.
 * 
 * @author Thiago Delgado Pinto
 */
export class BeforeAllLexer extends KeywordBlockLexer< TestEventBlock > {
    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_ALL );
    }
}

/**
 * Detects an AfterAll.
 * 
 * @author Thiago Delgado Pinto
 */
export class AfterAllLexer extends KeywordBlockLexer< TestEventBlock > {
    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_ALL );
    }
}

/**
 * Detects a BeforeFeature.
 * 
 * @author Thiago Delgado Pinto
 */
export class BeforeFeatureLexer extends KeywordBlockLexer< TestEventBlock > {
    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_FEATURE );
    }
}

/**
 * Detects an AfterFeature.
 * 
 * @author Thiago Delgado Pinto
 */
export class AfterFeatureLexer extends KeywordBlockLexer< TestEventBlock > {
    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_FEATURE );
    }
}

/**
 * Detects a BeforeScenarios.
 * 
 * @author Thiago Delgado Pinto
 */
export class BeforeScenariosLexer extends KeywordBlockLexer< TestEventBlock > {
    constructor( words: string[] ) {
        super( words, NodeTypes.BEFORE_SCENARIOS );
    }
}

/**
 * Detects an AfterScenarios.
 * 
 * @author Thiago Delgado Pinto
 */
export class AfterScenariosLexer extends KeywordBlockLexer< TestEventBlock > {
    constructor( words: string[] ) {
        super( words, NodeTypes.AFTER_SCENARIOS );
    }
}