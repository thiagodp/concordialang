"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const BlockLexer_1 = require("./BlockLexer");
const ListItemLexer_1 = require("./ListItemLexer");
/**
 * TestEventItem lexer.
 *
 * @author Thiago Delgado Pinto
 */
class TestEventItemLexer extends ListItemLexer_1.ListItemLexer {
    constructor() {
        super(NodeTypes_1.NodeTypes.TEST_EVENT_ITEM);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TEST_EVENT_ITEM];
    }
}
exports.TestEventItemLexer = TestEventItemLexer;
/**
 * Detects a BeforeAll.
 *
 * @author Thiago Delgado Pinto
 */
class BeforeAllLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.BEFORE_ALL);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TEST_EVENT_ITEM];
    }
}
exports.BeforeAllLexer = BeforeAllLexer;
/**
 * Detects an AfterAll.
 *
 * @author Thiago Delgado Pinto
 */
class AfterAllLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.AFTER_ALL);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TEST_EVENT_ITEM];
    }
}
exports.AfterAllLexer = AfterAllLexer;
/**
 * Detects a BeforeFeature.
 *
 * @author Thiago Delgado Pinto
 */
class BeforeFeatureLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.BEFORE_FEATURE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TEST_EVENT_ITEM];
    }
}
exports.BeforeFeatureLexer = BeforeFeatureLexer;
/**
 * Detects an AfterFeature.
 *
 * @author Thiago Delgado Pinto
 */
class AfterFeatureLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.AFTER_FEATURE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TEST_EVENT_ITEM];
    }
}
exports.AfterFeatureLexer = AfterFeatureLexer;
/**
 * Detects a BeforeScenarios.
 *
 * @author Thiago Delgado Pinto
 */
class BeforeScenariosLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.BEFORE_EACH_SCENARIO);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TEST_EVENT_ITEM];
    }
}
exports.BeforeScenariosLexer = BeforeScenariosLexer;
/**
 * Detects an AfterScenarios.
 *
 * @author Thiago Delgado Pinto
 */
class AfterScenariosLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.AFTER_EACH_SCENARIO);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TEST_EVENT_ITEM];
    }
}
exports.AfterScenariosLexer = AfterScenariosLexer;
//# sourceMappingURL=TestEventLexer.js.map