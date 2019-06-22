import { ListItem } from '../ast/ListItem';
import { NodeIterator } from './NodeIterator';
import { ParsingContext } from './ParsingContext';

/**
 * List item node parser.
 *
 * @author Thiago Delgado Pinto
 */
export interface ListItemNodeParser {

    isAccepted( node: ListItem, it: NodeIterator ): boolean;

    handle( node: ListItem, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean;

}