/**
 * Filter criterion
 * 
 * TO-DO: Support AND and OR constructions.
 * TO-DO: When AND and OR constructions are supported, replace 
 *        IMPORTANCE_XXX filters with TAG_VALUE_AS_NUMBER_XXX.
 *        E.g., IMPORTANCE_EQ = 7 could be generalized as 
 *              TAG_EQ = 'importance' AND TAG_VALUE_AS_NUMBER_EQ = 7.
 * 
 * @author Thiago Delgado Pinto
 */
export enum FilterCriterion {

    // GTE = Greater Than or Equal to
    // LTE = Less Than or Equal to
    // EQ  = Equal to
    // NEQ = Not Equal to

    IMPORTANCE_GTE = 'importance_gte',
    IMPORTANCE_LTE = 'importance_lte',
    IMPORTANCE_EQ = 'importance_eq',

    TAG_EQ = 'tag_eq',
    TAG_NEQ = 'tag_neq',

    NAME_EQ = 'name_eq',
    NAME_STARTING_WITH = 'name_starting_with',
    NAME_ENDING_WITH = 'name_ending_with',
    NAME_CONTAINING = 'name_containing'
}