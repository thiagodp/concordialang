import { SyntacticException } from "./SyntacticException";
/**
 * Constant block parser
 *
 * @author Thiago Delgado Pinto
 */
export class ConstantBlockParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        if (context.doc.constantBlock) {
            let e = new SyntacticException('Just one constant block declaration is allowed.', node.location);
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
