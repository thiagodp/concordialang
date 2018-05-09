"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * Regex block parser
 *
 * @author Thiago Delgado Pinto
 */
class RegexBlockParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        if (context.doc.regexBlock) {
            let e = new SyntaticException_1.SyntaticException('Just one regex block declaration is allowed.', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inRegexBlock = true;
        context.currentRegexBlock = node;
        // Add to the doc
        context.doc.regexBlock = node;
        return true;
    }
}
exports.RegexBlockParser = RegexBlockParser;
//# sourceMappingURL=RegexBlockParser.js.map