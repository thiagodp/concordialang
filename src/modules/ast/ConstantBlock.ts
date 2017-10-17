import { ContentNode } from './Node';
import { Constant } from './Constant';
import { Block } from './Block';

/**
 * Constant block node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface ConstantBlock extends ContentNode, Block< Constant > {
}