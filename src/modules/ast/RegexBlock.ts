import { Node, HasItems } from './Node';
import { Regex } from './Regex';

/**
 * Regular expression block node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface RegexBlock extends Node, HasItems< Regex > {
}