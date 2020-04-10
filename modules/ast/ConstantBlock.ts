import { Block } from './Block';
import { Constant } from './Constant';
import { Node } from './Node';

/**
 * Constant block node.
 *
 * @author Thiago Delgado Pinto
 */
export interface ConstantBlock extends Node, Block< Constant > {
}