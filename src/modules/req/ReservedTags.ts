/**
 * Reserved tags.
 * 
 * @author Thiago Delgado Pinto
 */
export enum ReservedTags {

    GENERATED = 'generated', // example: @generated
    
    FEATURE = 'feature', // example: @feature( login )
    SCENARIO = 'scenario', // example: @scenario( sucessful login )
    TEMPLATE = 'template', // example: @template( successful login )

    GLOBAL = 'global', // example: @global
    IGNORE = 'ignore' // example: @ignore

}