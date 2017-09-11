import { NodeParser } from "./NodeParser";
import { Regex } from "../ast/Regex";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';

/**
 * Regex parser
 * 
 * @author Thiago Delgado Pinto
 */
export class RegexParser implements NodeParser< Regex > {
    
    /** @inheritDoc */
    public analyze( node: Regex, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Structure checking
        if ( ! context.doc.regexes ) {
            context.doc.regexes = [];
        }

        // Add the node
        context.doc.regexes.push( node );

        return true;
    }
    
}