import { Node } from './Node';
import { Tagged } from './Tagged';

// TAG
//
// Example 1:
// ```
// @important
// ```
//
// Example 2:
// ```
// @one @two
// ```

/**
 * Tag node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Tag extends Node, Tagged {
}