import { Block } from './Block';
import { Node } from './Node';
import { Regex } from './Regex';

/**
 * Regular expression block node.
 *
 * @author Thiago Delgado Pinto
 */
export interface RegexBlock extends Node, Block< Regex > {
}