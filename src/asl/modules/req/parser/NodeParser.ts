import { Node } from '../ast/Node';
import { SyntaticException } from '../SyntaticException';
import { NodeIterator } from './NodeIterator';
import { ParsingContext } from './ParsingContext';

/**
 * Node parser
 * 
 * @author Thiago Delgado Pinto
 */
export interface NodeParser< T extends Node > {

    /**
     * Perform a syntatic analysis of the given node. ???
     * 
     * @param node Node to be analyzed.
     */
    analyze( node: T, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean;

}