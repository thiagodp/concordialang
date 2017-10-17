import { ContentNode } from './Node';
import { Regex } from './Regex';
import { Block } from './Block';

/**
 * Regular expression block node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface RegexBlock extends ContentNode, Block< Regex > {
}