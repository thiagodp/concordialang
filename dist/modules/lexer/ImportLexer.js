"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isValidPath = require("is-valid-path");
const NodeTypes_1 = require("../req/NodeTypes");
const QuotedNodeLexer_1 = require("./QuotedNodeLexer");
/**
 * Detects an Import.
 *
 * @author Thiago Delgado Pinto
 */
class ImportLexer extends QuotedNodeLexer_1.QuotedNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.IMPORT);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.FEATURE, NodeTypes_1.NodeTypes.VARIANT];
    }
    /**
     * @inheritdoc
     */
    isValidName(name) {
        return isValidPath(name);
    }
}
exports.ImportLexer = ImportLexer;
