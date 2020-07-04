"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const NamedNodeLexer_1 = require("./NamedNodeLexer");
/**
 * Detects a Scenario.
 *
 * @author Thiago Delgado Pinto
 */
class ScenarioLexer extends NamedNodeLexer_1.NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.SCENARIO);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN, NodeTypes_1.NodeTypes.SCENARIO, NodeTypes_1.NodeTypes.VARIANT_BACKGROUND, NodeTypes_1.NodeTypes.VARIANT];
    }
}
exports.ScenarioLexer = ScenarioLexer;
