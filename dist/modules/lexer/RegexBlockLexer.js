"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const BlockLexer_1 = require("./BlockLexer");
/**
 * Detects a Regex Block.
 *
 * @author Thiago Delgado Pinto
 */
class RegexBlockLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.REGEX_BLOCK);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.REGEX];
    }
}
exports.RegexBlockLexer = RegexBlockLexer;
