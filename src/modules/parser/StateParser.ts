import { NodeParser } from "./NodeParser";
import { State } from "../ast/State";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';

/**
 * State parser
 * 
 * @author Thiago Delgado Pinto
 */
export class StateParser implements NodeParser< State > {
    
    /** @inheritDoc */
    public analyze( node: State, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Structure checking
        if ( ! context.doc.states ) {
            context.doc.states = [];
        }

        // Add the node
        context.doc.states.push( node );

        return true;
    }
    
}