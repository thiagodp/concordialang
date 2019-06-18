"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("../req/SyntacticException");
/**
 * Regex block parser
 *
 * @author Thiago Delgado Pinto
 */
class RegexBlockParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        if (context.doc.regexBlock) {
            let e = new SyntacticException_1.SyntacticException('Just one regex block declaration is allowed.', node.location);
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
