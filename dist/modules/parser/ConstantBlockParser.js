"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("../req/SyntacticException");
/**
 * Constant block parser
 *
 * @author Thiago Delgado Pinto
 */
class ConstantBlockParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        if (context.doc.constantBlock) {
            let e = new SyntacticException_1.SyntacticException('Just one constant block declaration is allowed.', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inConstantBlock = true;
        context.currentConstantBlock = node;
        // Add to the doc
        context.doc.constantBlock = node;
        return true;
    }
}
exports.ConstantBlockParser = ConstantBlockParser;
