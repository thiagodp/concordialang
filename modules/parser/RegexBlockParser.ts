import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { SyntaticException } from "../req/SyntaticException";
import { RegexBlock } from "../ast/RegexBlock";

/**
 * Regex block parser
 * 
 * @author Thiago Delgado Pinto
 */
export class RegexBlockParser implements NodeParser< RegexBlock > {
    
    /** @inheritDoc */
    public analyze( node: RegexBlock, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        if ( context.doc.regexBlock ) {
            let e = new SyntaticException( 'Just one regex block declaration is allowed.', node.location );
            errors.push( e );
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