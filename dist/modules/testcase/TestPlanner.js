"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objectToArray = require("object-to-array");
const DataTestCaseAnalyzer_1 = require("../testdata/DataTestCaseAnalyzer");
const Random_1 = require("../testdata/random/Random");
const RandomLong_1 = require("../testdata/random/RandomLong");
const TestPlan_1 = require("./TestPlan");
/**
 * Uses the given mixing strategy to select the DataTestCases that will be included
 * for every UI Element and then combine these DataTestCases to form TestPlans.
 *
 * @author Thiago Delgado Pinto
 */
class TestPlanner {
    /**
     * Constructor
     *
     * @param mixingStrategy How many UI Elements will receive invalid data at a time.
     * @param combinationStrategy How the DataTestCases of each UI Element will be combined.
     */
    constructor(mixingStrategy, combinationStrategy, seed) {
        this.mixingStrategy = mixingStrategy;
        this.combinationStrategy = combinationStrategy;
        this.seed = seed;
    }
    /**
     * Produces test plans, i.e., maps from UI Elements variables to UIETestPlan, in which
     * the expected result and oracles are embedded.
     *
     * @param map   A map from UI Element Variables to another map containing all
     *              available DataTestCases and their respective expected result
     *              (valid, invalid or incompatible) and Oracle steps (if applicable).
     *
     * @param alwaysValidVariables  UI Element Variables that should always be valid.
     */
    make(map, alwaysValidVariables) {
        let plans = [];
        // console.log( 'alwaysValidVariables', alwaysValidVariables );
        // console.log( 'INPUT map      ', map );
        if (alwaysValidVariables.length > 0) {
            const randomLong = new RandomLong_1.RandomLong(new Random_1.Random(this.seed));
            for (let uieVar of alwaysValidVariables) {
                let dtcMap = map.get(uieVar);
                if (!dtcMap) {
                    continue;
                }
                for (let [dtc, data] of dtcMap) {
                    if (data.result === DataTestCaseAnalyzer_1.DTCAnalysisResult.INVALID || data.result === DataTestCaseAnalyzer_1.DTCAnalysisResult.INCOMPATIBLE) {
                        dtcMap.delete(dtc);
                    }
                }
                let count = dtcMap.size;
                if (count > 1) {
                    let index = randomLong.between(0, count - 1);
                    let arr = Array.from(dtcMap);
                    let [dtc, data] = arr[index];
                    dtcMap.clear();
                    dtcMap.set(dtc, data);
                }
            }
            // console.log( 'REDUCED map      ', map );
        }
        let objects = this.mixingStrategy.select(map, alwaysValidVariables);
        // console.log( 'SELECTED by mix', objects, 'by', this.mixingStrategy.constructor.name );
        // // Reduction for the always valid variables
        // if ( alwaysValidVariables.length > 0 ) {
        //     let randomLong = new RandomLong( new Random( this.seed ) );
        //     for ( let uieVar of alwaysValidVariables || [] ) {
        //         for ( let obj of objects ) {
        //             let validPlans = obj[ uieVar ];
        //             // console.log( 'Plans of', uieVar, ':', validPlans );
        //             // Chooses only one, randomly
        //             const max = validPlans.length;
        //             if ( max > 0 ) {
        //                 if ( 1 === max ) {
        //                     obj[ uieVar ] = [ validPlans[ 0 ] ];
        //                 } else {
        //                     let index = randomLong.between( 0, max - 1 );
        //                     obj[ uieVar ] = [ validPlans[ index ] ];
        //                 }
        //             }
        //         }
        //     }
        //     // console.log( 'AFTER REDUCTION', objects );
        // }
        // Each object is a map with an array of UIEPlans
        for (let obj of objects) {
            let combinations = this.combinationStrategy.combine(obj);
            // console.log( 'combinations ', combinations, 'by', this.combinationStrategy.constructor.name );
            // Each combination now is a map uieName => UIEPlan
            // It will be transformed in a TestPlan
            for (let combObj of combinations) {
                let plan = new TestPlan_1.TestPlan();
                plan.dataTestCases = new Map(objectToArray(combObj));
                plans.push(plan);
            }
        }
        return plans;
    }
}
exports.TestPlanner = TestPlanner;
