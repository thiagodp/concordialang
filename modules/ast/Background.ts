import { Node } from './Node';
import { Step } from './Step';

/**
 * Background node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Background extends Node {
    sentences: Array< Step >;
}