import { NodeTypes } from '../req/NodeTypes';
import { BlockLexer } from './BlockLexer';
export class BeforeAllLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.BEFORE_ALL);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN];
    }
}
export class AfterAllLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.AFTER_ALL);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN];
    }
}
export class BeforeFeatureLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.BEFORE_FEATURE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN];
    }
}
export class AfterFeatureLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.AFTER_FEATURE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN];
    }
}
export class BeforeEachScenarioLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.BEFORE_EACH_SCENARIO);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN];
    }
}
export class AfterEachScenarioLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.AFTER_EACH_SCENARIO);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN];
    }
}
