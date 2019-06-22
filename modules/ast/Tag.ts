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

    subType?: ReservedTags;
}

/**
 * Reserved tags.
 *
 * @author Thiago Delgado Pinto
 */
export enum ReservedTags {

    GENERATED = 'generated', // example: @generated
    FAIL = 'fail', // example: @fail

    FEATURE = 'feature', // example: @feature( <name> )
    SCENARIO = 'scenario', // example: @scenario( <index> )
    VARIANT = 'variant', // example: @variant( <index> )

    GLOBAL = 'global', // example: @global
    IGNORE = 'ignore', // example: @ignore
    IMPORTANCE = 'importance', // example: @importance( 5 )

    GENERATE_ONLY_VALID_VALUES = 'generate-only-valid-values' // example: @generate-only-valid-values

}

/**
 * Allows to define something that may have tags.
 *
 * @author Thiago Delgado Pinto
 */
export interface MayHaveTags {
    tags?: Tag[];
}


/**
 * Returns true if the one of the given tags has the given name.
 *
 * @param name Tag name
 * @param tags Tags where to find
 */
export function hasTagNamed( name: string, tags: Tag[] ): boolean {
    return !! tags.find( tag => tag.name === name );
}


export function tagsWithAnyOfTheNames( tags: Tag[], names: string[] ): Tag[] {
    return tags.filter( t => names.indexOf( t.name.toLowerCase() ) >= 0 );
}