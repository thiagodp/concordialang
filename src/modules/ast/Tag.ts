import { Node, HasName, HasContent } from './Node';

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
 * Tag node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Tag extends Node, HasName, HasContent {
}

/**
 * Allows to define something that may have tags.
 * 
 * @author Thiago Delgado Pinto
 */
export interface MayHaveTags {
    tags?: Tag[];
}