/**
 * Reserved tags.
 *
 * @author Thiago Delgado Pinto
 */
export enum ReservedTags {

    GENERATED = 'generated', //     example: @generated
    SHOULD_FAIL = 'fail', //        example: @fail

    FEATURE = 'feature', //         example: @feature( <name> )
    SCENARIO = 'scenario', //       example: @scenario( <index> )
    VARIANT = 'variant', //         example: @variant( <index> )

    GLOBAL = 'global', //           example: @global
    IGNORE = 'ignore', //           example: @ignore
    IMPORTANCE = 'importance' //    example: @importance( 5 )

}