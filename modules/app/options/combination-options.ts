
// export type ValueOf<T> = T extends any[] ? T[number] : T[keyof T]; // it does not work for enum

/**
 * Reduces the Variants that produce a certain State required by a Precondition
 * or by a State Call. The scenarios of these Variants will be combined with
 * the current scenario. Thus, the lesser the Variants to combine, the lower is
 * the number of produced Test Scenarios and so is will be the number of Test Cases.
 *
 * @see VariantSelectionStrategy
 */
export enum VariantSelectionOptions {
    SINGLE_RANDOM = 'random',
    FIRST = 'first',
    FIRST_MOST_IMPORTANT = 'fmi',
    ALL = 'all'
}
/**
 * Generic combination options
 *
 * @see CombinationStrategy
 */
export enum CombinationOptions {
    SINGLE_RANDOM_OF_EACH = 'sre',
    SHUFFLED_ONE_WISE = 'sow',
    ONE_WISE = 'ow',
    ALL = 'all'
}
/**
 * Indicates the combination of States, i.e., how the Test Scenarios that will
 * replace them will be combined.
 *
 * Every Precondition and State Call has to be replaced by a Test Scenario. However,
 * each one may have many Test Scenarios, and their combination may produce a lot
 * of new Test Scenarios.
 *
 * @see CombinationOptions
 */
export type StateCombinationOptions = CombinationOptions;
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
export enum InvalidSpecialOptions {

	ZERO = '0',
	ONE = '1',

    NONE = 'none',
	ALL = 'all',

    /**
     * Leave the mix untouched (i.e., does not filter the DataTestCases of each UI Element ) and
     * apply SHUFFLED_ONE_WISE combination for the DataTestCases.
     *
     * !!! THIS OPTION CHANGES THE COMBINATION OF DataTestCases THAT WAS CHOSEN BY THE USER !!!
     */
    RANDOM = 'random',
    /**
     * Leave the mix untouched (i.e., does not filter the DataTestCases of each UI Element ).
     */
    DEFAULT = 'smart'
}
/**
 * Indicates how the DataTestCases of each UI Element will be combined.
 *
 * @see CombinationOptions
 */
export type DataTestCaseCombinationOptions = CombinationOptions;
