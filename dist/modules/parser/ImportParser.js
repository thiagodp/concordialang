import { SyntacticException } from "./SyntacticException";
/**
 * Import parser.
 *
 * @author Thiago Delgado Pinto
 */
export class ImportParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks the structure
        if (!context.doc.imports) {
            context.doc.imports = [];
        }
        // Checks if a feature is declared before it
        if (context.doc.feature) {
            let e = new SyntacticException('An import must be declared before a feature.', node.location);
            errors.push(e);
            return false;
        }
        // Add the import node to the document
        context.doc.imports.push(node);
        return true;
    }
}
