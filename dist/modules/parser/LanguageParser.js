import { SyntacticException } from './SyntacticException';
/**
 * Language parser
 *
 * @author Thiago Delgado Pinto
 */
export class LanguageParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Nothing to check
        if (!context) {
            return false;
        }
        // Checks if it is already declared
        if (context.doc.language) {
            let e = new SyntacticException('Just one language declaration is allowed.', node.location);
            errors.push(e);
            return false;
        }
        // Checks if an import is declared before it
        if (context.doc.imports && context.doc.imports.length > 0) {
            let e = new SyntacticException('The language must be declared before an import.', node.location);
            errors.push(e);
            return false;
        }
        // Checks if a feature is declared before it
        if (context.doc.feature) {
            let e = new SyntacticException('The language must be declared before a feature.', node.location);
            errors.push(e);
            return false;
        }
        context.doc.language = node;
        return true;
    }
}
