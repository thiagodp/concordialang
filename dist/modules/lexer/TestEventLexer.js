"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AfterEachScenarioLexer = exports.BeforeEachScenarioLexer = exports.AfterFeatureLexer = exports.BeforeFeatureLexer = exports.AfterAllLexer = exports.BeforeAllLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const BlockLexer_1 = require("./BlockLexer");
class BeforeAllLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.BEFORE_ALL);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN];
    }
}
exports.BeforeAllLexer = BeforeAllLexer;
class AfterAllLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.AFTER_ALL);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN];
    }
}
exports.AfterAllLexer = AfterAllLexer;
class BeforeFeatureLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.BEFORE_FEATURE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN];
    }
}
exports.BeforeFeatureLexer = BeforeFeatureLexer;
class AfterFeatureLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.AFTER_FEATURE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN];
    }
}
exports.AfterFeatureLexer = AfterFeatureLexer;
class BeforeEachScenarioLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.BEFORE_EACH_SCENARIO);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN];
    }
}
exports.BeforeEachScenarioLexer = BeforeEachScenarioLexer;
class AfterEachScenarioLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.AFTER_EACH_SCENARIO);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN];
    }
}
exports.AfterEachScenarioLexer = AfterEachScenarioLexer;
