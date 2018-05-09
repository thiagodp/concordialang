"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var FilterCriterion;
(function (FilterCriterion) {
    // GTE = Greater Than or Equal to
    // LTE = Less Than or Equal to
    // EQ  = Equal to
    // NEQ = Not Equal to
    FilterCriterion["IMPORTANCE_GTE"] = "importance_gte";
    FilterCriterion["IMPORTANCE_LTE"] = "importance_lte";
    FilterCriterion["IMPORTANCE_EQ"] = "importance_eq";
    FilterCriterion["IGNORE_TAG_NOT_DECLARED"] = "ignore_tag_not_declared";
    FilterCriterion["TAG_EQ"] = "tag_eq";
    FilterCriterion["TAG_NEQ"] = "tag_neq";
    FilterCriterion["TAG_IN"] = "tag_in";
    FilterCriterion["TAG_NOT_IN"] = "tag_not_in";
    FilterCriterion["NAME_EQ"] = "name_eq";
    FilterCriterion["NAME_STARTING_WITH"] = "name_starting_with";
    FilterCriterion["NAME_ENDING_WITH"] = "name_ending_with";
    FilterCriterion["NAME_CONTAINING"] = "name_containing";
})(FilterCriterion = exports.FilterCriterion || (exports.FilterCriterion = {}));
//# sourceMappingURL=FilterCriterion.js.map