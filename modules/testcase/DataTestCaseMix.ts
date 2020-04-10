import { DTCAnalysisResult, UIEVariableToDTCMap } from '../testdata/DataTestCaseAnalyzer';
import { UIETestPlan } from './UIETestPlan';


// /**
//  * Returns a new map with only the given UI Element Variables.
//  *
//  * @param map Map to filter.
//  * @param uieVariables UI Element Variables.
//  */
// function filterUIEVariableToDTCMap( map: UIEVariableToDTCMap, uieVariables: string[] ): UIEVariableToDTCMap {
//     let newMap = new Map< string, Map< DataTestCase, Pair< DTCAnalysisResult, Step[] > > >();
//     for ( let uiev of uieVariables ) {
//         if ( map.has( uiev ) ) {
//             newMap.set( uiev, map.get( uiev ) );
//         }
//     }
//     return newMap;
// }

/**
 * Indicates the mix of VALID and INVALID DataTestCases that will be combined later.
 *
 * @author Thiago Delgado Pinto
 */
export interface DataTestCaseMix {

    /**
     * Selects the mixes of DataTestCases to use in a test case.
     *
     *
     * @param map   A map from UI Element Variables to another map containing all
     *              available DataTestCases and their respective expected result
     *              (valid, invalid or incompatible) and Oracle steps (if applicable).
     *
     * @param alwaysValidVariables  UI Element Variables that should always remain valid.
     *
     * @returns     An array with objects, in which each object maps UI Element Variables
     *              to an array of UIETestPlan.
     *
     */
    select( map: UIEVariableToDTCMap, alwaysValidVariables: string[] ): object[];

}

/**
 * All UI Elements will contain VALID DataTestCases only.
 *
 * Useful mainly for producing combinations for Preconditions or State Calls, in which
 * the called Test Cases must produce the required State.
 *
 * Example:
 * ```
 * [
 *  {
 *      "a": [ VALUE_MIN => valid, VALUE_MAX => valid ]
 *      "b": [ LENGTH_MIN => valid, LENGTH_MAX => valid ]
 *      "c": [ FORMAT_VALID => valid ]
 *  },
 * ```
 *
 * @author Thiago Delgado Pinto
 */
export class OnlyValidMix implements DataTestCaseMix {

    /** @inheritDoc */
    select( map: UIEVariableToDTCMap, alwaysValidVariables: string[] ): object[] {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {
            obj[ uieName ] = [];
            for ( let [ dtc, data ] of dtcMap ) {
                if ( DTCAnalysisResult.VALID === data.result ) {
                    obj[ uieName ].push( new UIETestPlan( dtc, data.result, data.oracles ) );
                }
            }
        }
        return [ obj ];
    }

}


/**
 * One UI Element will contain only INVALID DataTestCases and
 * the other ones will contain only VALID DataTestCases.
 *
 * Useful for testing a single UI Element at a time.
 *
 * Example:
 * ```
 * [
 *  {
 *      "a": [ VALUE_BELOW_MIN => invalid, VALUE_ABOVE_MAX => invalid ] << first with invalids
 *      "b": [ LENGTH_MIN => valid, LENGTH_MAX => valid ]
 *      "c": [ FORMAT_VALID => valid ]
 *  },
 *  {
 *      "a": [ VALUE_MIN => valid, VALUE_MAX => valid ]
 *      "b": [ LENGTH_BELOW_MIN => invalid, LENGTH_ABOVE_MAX => invalid ] << second with invalids
 *      "c": [ FORMAT_VALID => valid ]
 *  },
  *  {
 *      "a": [ VALUE_MIN => valid, VALUE_MAX => valid ]
 *      "b": [ LENGTH_MIN => invalid, LENGTH_MAX => valid ]
 *      "c": [ FORMAT_INVALID => valid ] << third with invalids
 *  },*
 * ]
 * ```
 *
 *
 * @author Thiago Delgado Pinto
 */
export class JustOneInvalidMix implements DataTestCaseMix {

    /** @inheritDoc */
    select( map: UIEVariableToDTCMap, alwaysValidVariables: string[] ): object[] {
        let all = [];
        for ( let [ uieName, /* dtcMap */ ] of map ) {
            let obj = this.oneUIEWithInvalidDataTestCasesAndTheOthersWithValid(
                map, uieName, alwaysValidVariables );
            all.push( obj );
        }
        return all;
    }

    private oneUIEWithInvalidDataTestCasesAndTheOthersWithValid(
        map: UIEVariableToDTCMap,
        targetUIEName: string,
        alwaysValidVariables: string[]
    ): object {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {

            obj[ uieName ] = [];
            let isTheTargetUIE = uieName === targetUIEName;
            let currentMustBeValid = alwaysValidVariables.indexOf( uieName ) >= 0;

            for ( let [ dtc, data ] of dtcMap ) {

                if ( DTCAnalysisResult.VALID === data.result ) {
                    if ( ! isTheTargetUIE || currentMustBeValid ) {
                        obj[ uieName ].push( new UIETestPlan( dtc, data.result, data.oracles ) );
                    }
                } else if ( DTCAnalysisResult.INVALID === data.result ) {
                    if ( isTheTargetUIE && ! currentMustBeValid ) {
                        obj[ uieName ].push( new UIETestPlan( dtc, data.result, data.oracles ) );
                    }
                }
            }
        }
        return obj;
    }

}

// TODO: InvalidPairMix - only two UI Elements will receive INVALID DataTestCases at a time

// TODO: InvalidTripletMix - only three UI Elements will receive INVALID DataTestCases at a time

// TODO: UntouchedMix - all the DataTestCases will be combined.

/**
 * All UI Elements will contain INVALID DataTestCases only.
 *
 * Useful testing all the exceptional conditions simultaneously.
 *
 * Example:
 * ```
 * [
 *  {
 *      "a": [ VALUE_BELOW_MIN => invalid, VALUE_ABOVE_MAX => invalid ]
 *      "b": [ LENGTH_BELOW_MIN => invalid, LENGTH_ABOVE_MAX => invalid ]
 *      "c": [ FORMAT_INVALID => valid ]
 *  }
 * ]
 *
 * @author Thiago Delgado Pinto
 */
export class OnlyInvalidMix implements DataTestCaseMix {

    /** @inheritDoc */
    select( map: UIEVariableToDTCMap, alwaysValidVariables: string[] ): object[] {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {
            obj[ uieName ] = [];
            let currentMustBeValid = alwaysValidVariables.indexOf( uieName ) >= 0;
            for ( let [ dtc, data ] of dtcMap ) {
                if ( ( DTCAnalysisResult.INVALID === data.result && ! currentMustBeValid )
                    || ( DTCAnalysisResult.VALID === data.result && currentMustBeValid ) ) {

                    obj[ uieName ].push( new UIETestPlan( dtc, data.result, data.oracles ) );
                }
            }
        }
        return [ obj ];
    }

}

/**
 * Does not filter the available elements, except for the incompatible ones
 * and the alwaysValidVariables.
 *
 * @author Thiago Delgado Pinto
 */
export class UnfilteredMix implements DataTestCaseMix {

    /** @inheritDoc */
    select( map: UIEVariableToDTCMap, alwaysValidVariables: string[] ): object[] {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {
            obj[ uieName ] = [];
            let currentMustBeValid = alwaysValidVariables.indexOf( uieName ) >= 0;
            for ( let [ dtc, data ] of dtcMap ) {
                if ( DTCAnalysisResult.INCOMPATIBLE === data.result
                    || ( currentMustBeValid && DTCAnalysisResult.INVALID === data.result ) ) {
                    continue;
                }
                obj[ uieName ].push( new UIETestPlan( dtc, data.result, data.oracles ) );
            }

        }
        return [ obj ];
    }

}