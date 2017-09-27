import { Node, HasItems } from './Node';
import { Constant } from './Constant';

/**
 * Constant block node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface ConstantBlock extends Node, HasItems< Constant > {
}