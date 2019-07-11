import { ConstantBlock } from "../ast/ConstantBlock";
import { SyntacticException } from "./SyntacticException";
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';

/**
 * Constant block parser
 *
 * @author Thiago Delgado Pinto
 */
export class ConstantBlockParser implements NodeParser< ConstantBlock > {

    /** @inheritDoc */
    public analyze( node: ConstantBlock, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        if ( context.doc.constantBlock ) {
            let e = new SyntacticException( 'Just one constant block declaration is allowed.', node.location );
            errors.push( e );
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