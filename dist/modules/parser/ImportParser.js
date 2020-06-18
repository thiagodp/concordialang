"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("./SyntacticException");
/**
 * Import parser.
 *
 * @author Thiago Delgado Pinto
 */
class ImportParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks the structure
        if (!context.doc.imports) {
            context.doc.imports = [];
        }
        // Checks if a feature is declared before it
        if (context.doc.feature) {
            let e = new SyntacticException_1.SyntacticException('An import must be declared before a feature.', node.location);
            errors.push(e);
            return false;
        }
        // Add the import node to the document
        context.doc.imports.push(node);
        return true;
    }
}
exports.ImportParser = ImportParser;
