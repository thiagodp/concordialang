import { HasTags } from './Tag';

// TAG LINE
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
 * Tag line (is not a node).
 * 
 * @author Thiago Delgado Pinto
 */
export interface TagLine extends HasTags {
}