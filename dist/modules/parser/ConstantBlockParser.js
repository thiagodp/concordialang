"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * Constant block parser
 *
 * @author Thiago Delgado Pinto
 */
class ConstantBlockParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        if (context.doc.constantBlock) {
            let e = new SyntaticException_1.SyntaticException('Just one constant block declaration is allowed.', node.location);
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
//# sourceMappingURL=ConstantBlockParser.js.map