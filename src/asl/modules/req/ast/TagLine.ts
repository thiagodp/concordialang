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
//
// Example 3:
// ```
// @hello( "world" ) @age( 5 )
// ```
//

/**
 * Tag line node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface TagLine extends Node, Tagged {
}