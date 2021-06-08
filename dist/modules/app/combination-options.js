"use strict";
// export type ValueOf<T> = T extends any[] ? T[number] : T[keyof T]; // it does not work for enum
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidSpecialOptions = exports.CombinationOptions = exports.VariantSelectionOptions = void 0;
/**
 * Reduces the Variants that produce a certain State required by a Precondition
 * or by a State Call. The scenarios of these Variants will be combined with
 * the current scenario. Thus, the lesser the Variants to combine, the lower is
 * the number of produced Test Scenarios and so is will be the number of Test Cases.
 *
 * @see VariantSelectionStrategy
 */
var VariantSelectionOptions;
(function (VariantSelectionOptions) {
    VariantSelectionOptions["SINGLE_RANDOM"] = "random";
    VariantSelectionOptions["FIRST"] = "first";
    VariantSelectionOptions["FIRST_MOST_IMPORTANT"] = "fmi";
    VariantSelectionOptions["ALL"] = "all";
})(VariantSelectionOptions = exports.VariantSelectionOptions || (exports.VariantSelectionOptions = {}));
/**
 * Generic combination options
 *
 * @see CombinationStrategy
 */
var CombinationOptions;
(function (CombinationOptions) {
    CombinationOptions["SINGLE_RANDOM_OF_EACH"] = "sre";
    CombinationOptions["SHUFFLED_ONE_WISE"] = "sow";
    CombinationOptions["ONE_WISE"] = "ow";
    CombinationOptions["ALL"] = "all";
})(CombinationOptions = exports.CombinationOptions || (exports.CombinationOptions = {}));
/**
 * Number of UI Elements that will receive invalid DataTestCases at a time.
 *
 * The values can be indicated with a number or a string value.
 * The possible string values are defined with this enum type.
 *
 *     invalid=0 or "none"  -> elements will only receive valid values
 *
 *     invalid=1            -> one element will receive an invalid value (default)
 *     invalid=2            -> two elements will receive an invalid value
 *     ...
 *     invalid=all          -> elements will only receive invalid values
 *
 *     invalid=random       -> a random number of elements will receive invalid values (shuffled-one-wise?)
 *
 *     invalid=default      -> leave as is
 */
var InvalidSpecialOptions;
(function (InvalidSpecialOptions) {
    InvalidSpecialOptions["ZERO"] = "0";
    InvalidSpecialOptions["ONE"] = "1";
    InvalidSpecialOptions["NONE"] = "none";
    InvalidSpecialOptions["ALL"] = "all";
    /**
     * Leave the mix untouched (i.e., does not filter the DataTestCases of each UI Element ) and
     * apply SHUFFLED_ONE_WISE combination for the DataTestCases.
     *
     * !!! THIS OPTION CHANGES THE COMBINATION OF DataTestCases THAT WAS CHOSEN BY THE USER !!!
     */
    InvalidSpecialOptions["RANDOM"] = "random";
    /**
     * Leave the mix untouched (i.e., does not filter the DataTestCases of each UI Element ).
     */
    InvalidSpecialOptions["DEFAULT"] = "smart";
})(InvalidSpecialOptions = exports.InvalidSpecialOptions || (exports.InvalidSpecialOptions = {}));
