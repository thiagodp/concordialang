import { DataTestCase } from "../testdata/DataTestCase";
import { Pair } from "ts-pair";
import { DTCAnalysisResult } from "../testdata/DataTestCaseAnalyzer";
import { Step } from "../ast/Step";
import { UIETestPlan } from "./UIETestPlan";

/**
 * A map from UI Element Variables to anoher map containing all available DataTestCases
 * and their respective expected result (valid, invalid or incompatible) plus the eventual
 * Oracle steps applicable in case of a invalid result.
 */
export type TestAnalysisMap = Map< string, Map< DataTestCase, Pair< DTCAnalysisResult, Step[] > > >;

// /**
//  * Returns a new map with only the given UI Element Variables.
//  *
//  * @param map Map to filter.
//  * @param uieVariables UI Element Variables.
//  */
// function filterTestAnalysisMap( map: TestAnalysisMap, uieVariables: string[] ): TestAnalysisMap {
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
     * @param map   A map from UI Element Variables to anoher map containing all
     *              available DataTestCases and their respective expected result
     *              (valid, invalid or incompatible) and Oracle steps (if applicable).
     *
     * @param alwaysValidVariables  UI Element Variables that should always remain valid.
     *
     * @returns     An array with objects, in which each object maps UI Element Variables
     *              to an array of UIETestPlan.
     *
     */
    select( map: TestAnalysisMap, alwaysValidVariables: string[] ): object[];

}

/**
 * All UI Elements will contain VALID DataTestCases only.
 *
 * Useful mainly for producing combinations for Preconditions or State Calls, in which
 * the called Test Cases must produce the required State.
 *
 * @author Thiago Delgado Pinto
 */
export class OnlyValidMix implements DataTestCaseMix {

    /** @inheritDoc */
    select( map: TestAnalysisMap, alwaysValidVariables: string[] ): object[] {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {
            obj[ uieName ] = [];
            for ( let [ dtc, pair ] of dtcMap ) {
                if ( DTCAnalysisResult.VALID === pair.getFirst() ) {
                    obj[ uieName ].push( new UIETestPlan( dtc, pair.getFirst(), pair.getSecond() ) );
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
 * @author Thiago Delgado Pinto
 */
export class JustOneInvalidMix implements DataTestCaseMix {

    /** @inheritDoc */
    select( map: TestAnalysisMap, alwaysValidVariables: string[] ): object[] {
        let all = [];
        for ( let [ uieName, dtcMap ] of map ) {
            let obj = this.oneUIEWithInvalidDataTestCasesAndTheOthersWithValid(
                map, uieName, alwaysValidVariables );
            all.push( obj );
        }
        return all;
    }

    private oneUIEWithInvalidDataTestCasesAndTheOthersWithValid(
        map: TestAnalysisMap,
        targetUIEName: string,
        alwaysValidVariables: string[]
    ): object {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {

            obj[ uieName ] = [];
            let isTheTargetUIE = uieName === targetUIEName;
            let mustAlwaysBeValid = alwaysValidVariables.indexOf( uieName ) >= 0;

            for ( let [ dtc, pair ] of dtcMap ) {

                let [ first, second ] = pair.toArray();

                if ( DTCAnalysisResult.INCOMPATIBLE === first ) {
                    continue;
                }

                if ( DTCAnalysisResult.VALID === first ) {
                    if ( mustAlwaysBeValid || ! isTheTargetUIE ) {
                        obj[ uieName ].push( new UIETestPlan( dtc, first, second ) );
                    }
                } else { // INVALID
                    if ( isTheTargetUIE && ! mustAlwaysBeValid ) {
                        obj[ uieName ].push( new UIETestPlan( dtc, first, second ) );
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
 * @author Thiago Delgado Pinto
 */
export class OnlyInvalidMix implements DataTestCaseMix {

    /** @inheritDoc */
    select( map: TestAnalysisMap, alwaysValidVariables: string[] ): object[] {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {
            obj[ uieName ] = [];
            let mustAlwaysBeValid = alwaysValidVariables.indexOf( uieName ) >= 0;
            for ( let [ dtc, pair ] of dtcMap ) {
                let [ first, second ] = pair.toArray();
                if ( DTCAnalysisResult.INVALID === first && ! mustAlwaysBeValid ) {
                    obj[ uieName ].push( new UIETestPlan( dtc, first, second ) );
                } else if ( DTCAnalysisResult.VALID === first && mustAlwaysBeValid ) {
                    obj[ uieName ].push( new UIETestPlan( dtc, first, second ) );
                }
            }
        }
        return [ obj ];
    }

}


/**
 * Does not filter the available elements.
 *
 * @author Thiago Delgado Pinto
 */
export class UnfilteredMix implements DataTestCaseMix {

    /** @inheritDoc */
    select( map: TestAnalysisMap, alwaysValidVariables: string[] ): object[] {
        let all = [];
        for ( let [ uieName, dtcMap ] of map ) {
            let obj = {};
            for ( let [ uieName, dtcMap ] of map ) {
                obj[ uieName ] = [];
                for ( let [ dtc, pair ] of dtcMap ) {
                    obj[ uieName ].push( new UIETestPlan( dtc, pair.getFirst(), pair.getSecond() ) );
                }
            }
            all.push( obj );
        }
        return all;
    }

}