import { ListItem } from 'concordialang-types';
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