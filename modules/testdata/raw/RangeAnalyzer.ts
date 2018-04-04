/**
 * Range analyzer
 *
 * @author Thiago Delgado Pinto
 */
export interface RangeAnalyzer {

    hasValuesBelowMin(): boolean;

    hasValuesAboveMax(): boolean;

    hasValuesBetweenMinAndMax(): boolean;

    isZeroBetweenMinAndMax(): boolean;

}