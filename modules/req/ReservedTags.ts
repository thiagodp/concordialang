/**
 * Reserved tags.
 *
 * @author Thiago Delgado Pinto
 */
export enum ReservedTags {

    GENERATED = 'generated', //     example: @generated

    FEATURE = 'feature', //         example: @feature( login ) << NEEDED?
    SCENARIO = 'scenario', //       example: @scenario( sucessful login ) << NEEDED?
    VARIANT = 'variant', //         example: @variant( successful login )

    GLOBAL = 'global', //           example: @global
    IGNORE = 'ignore', //           example: @ignore
    IMPORTANCE = 'importance' //    example: @importance( 5 )

}