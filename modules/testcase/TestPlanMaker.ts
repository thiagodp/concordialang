import { DataTestCaseMix, TestAnalysisMap } from './DataTestCaseMix';
import { CombinationStrategy } from '../selection/CombinationStrategy';
import * as objectToArray from 'object-to-array';
import { TestPlan } from './TestPlan';

/**
 * Uses the given mixing strategy to select the DataTestCases that will be included
 * for every UI Element and then combine these DataTestCases to form TestPlans.
 *
 * @author Thiago Delgado Pinto
 */
export class TestPlanMaker {

    /**
     * Constructor
     *
     * @param mixingStrategy How many UI Elements will receive invalid data at a time.
     * @param combinationStrategy How the DataTestCases of each UI Element will be combined.
     */
    constructor(
        public readonly mixingStrategy: DataTestCaseMix,
        public readonly combinationStrategy: CombinationStrategy
    ) {
    }

    /**
     * Produces test plans, i.e., maps from UI Elements variables to UIETestPlan, in which
     * the expected result and oracles are embedded.
     *
     * @param map   A map from UI Element Variables to anoher map containing all
     *              available DataTestCases and their respective expected result
     *              (valid, invalid or incompatible) and Oracle steps (if applicable).
     *
     * @param alwaysValidVariables  UI Element Variables that should always be valid.
     */
    make(
        map: TestAnalysisMap,
        alwaysValidVariables: string[]
    ): TestPlan[] {

        let plans: TestPlan[] = [];

        let objects = this.mixingStrategy.select( map, alwaysValidVariables );
        // console.log( 'INPUT map      ', map );
        // console.log( 'SELECTED by mix', objects );

        // Each object is a map with an array of UIEPlans
        for ( let obj of objects ) {

            let combinations = this.combinationStrategy.combine( obj );
            // console.log( 'combinations ', combinations );

            // Each combination now is a map uieName => UIEPlan
            // Thet will be transformed in a TestPlan
            for ( let combObj of combinations ) {

                let plan = new TestPlan();
                plan.dataTestCases = new Map( objectToArray( combObj ) );

                plans.push( plan );
            }
        }

        return plans;
    }

}