import { Node, NamedNode } from './Node';

/**
 * Constant block node
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface ContantsBlock extends Node {
    contants: Array< Constant >;
}

/**
 * Constant node
 * 
 * @author Thiago Delgado Pinto
 * @see /doc/langspec/asl-en.md
 */
export interface Constant extends NamedNode {
    value: string;
}