import { ConstantBlock } from "concordialang-types/ast";
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { SyntaticException } from "../req/SyntaticException";

/**
 * Constant block parser
 *
 * @author Thiago Delgado Pinto
 */
export class ConstantBlockParser implements NodeParser< ConstantBlock > {

    /** @inheritDoc */
    public analyze( node: ConstantBlock, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        if ( context.doc.constantBlock ) {
            let e = new SyntaticException( 'Just one constant block declaration is allowed.', node.location );
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