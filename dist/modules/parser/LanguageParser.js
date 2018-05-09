"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * Language parser
 *
 * @author Thiago Delgado Pinto
 */
class LanguageParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if it is already declared
        if (context.doc.language) {
            let e = new SyntaticException_1.SyntaticException('Just one language declaration is allowed.', node.location);
            errors.push(e);
            return false;
        }
        // Checks if an import is declared before it
        if (context.doc.imports && context.doc.imports.length > 0) {
            let e = new SyntaticException_1.SyntaticException('The language must be declared before an import.', node.location);
            errors.push(e);
            return false;
        }
        // Checks if a feature is declared before it
        if (context.doc.feature) {
            let e = new SyntaticException_1.SyntaticException('The language must be declared before a feature.', node.location);
            errors.push(e);
            return false;
        }
        context.doc.language = node;
        return true;
    }
}
exports.LanguageParser = LanguageParser;
//# sourceMappingURL=LanguageParser.js.map