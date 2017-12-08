import { ListItem } from '../ast/ListItem';
import { NodeIterator } from './NodeIterator';
import { ParsingContext } from './ParsingContext';

/**
 * Property parser.
 * 
 * @author Thiago Delgado Pinto
 */
export interface PropertyParser {

    isAccepted( node: ListItem, it: NodeIterator ): boolean;

    handle( node: ListItem, context: ParsingContext, errors: Error[] ): boolean;

}