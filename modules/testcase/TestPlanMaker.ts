import { DataTestCase } from "../testdata/DataTestCase";
import { DTCAnalysisResult } from "../testdata/DataTestCaseAnalyzer";
import { Step } from "../ast/Step";
import { Pair } from "ts-pair";
import { TestPlan } from "../testcase/TestPlan";
import { CombinationStrategy } from "../selection/CombinationStrategy";
import { UIETestPlan } from "./UIETestPlan";
import * as objectToArray from 'object-to-array';


export enum TestGoal {
    ALL_VALID,
    ONE_INVALID_OTHERS_VALID,
    ALL_INVALID
}

//                     { Full variable name => { DTC => { Result, Otherwise steps }} }
type TestAnalysisMap = Map< string, Map< DataTestCase, Pair< DTCAnalysisResult, Step[] > > >;



export class TestPlanMaker {

    constructor(
        public readonly goal: TestGoal,
        public readonly combinationStrategy: CombinationStrategy
    ) {
    }

    make(
        map: TestAnalysisMap
    ): TestPlan[] {

        let plans: TestPlan[] = [];

        let objects = [];
        switch ( this.goal ) {
            case TestGoal.ALL_INVALID: {
                objects.push( this.allUIEWithInvalidDataTestCases( map ) );
                break;
            }
            case TestGoal.ONE_INVALID_OTHERS_VALID: {
                objects.push.apply( objects, this.arrayOfOneUIEWithInvalidDataTestCasesAndTheOthersWithValid( map ) );
                break;
            }
            default: {
                objects.push( this.allUIEWithValidDataTestCases( map ) );
            }
        }

        // Each object is a map with an array of UIEPlans
        for ( let obj of objects ) {
            let combinations = this.combinationStrategy.combine( obj );
            // Each combination now is a map uieName => UIEPlan
            // Thet will be transformed in a TestPlan
            for ( let comb of combinations ) {

                let plan = new TestPlan();
                plan.dataTestCases = new Map( objectToArray( obj ) );

                plans.push( plan );
            }
        }

        return plans;
    }

    // Returns Map< uieName => UIEPlan[] > as object
    allUIEWithValidDataTestCases( map: TestAnalysisMap ): object {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {
            obj[ uieName ] = [];
            for ( let [ dtc, pair ] of dtcMap ) {
                if ( DTCAnalysisResult.VALID === pair.first ) {
                    obj[ uieName ].push( new UIETestPlan( dtc, pair.first, pair.second ) );
                }
            }
        }
        return obj;
    }

    // Returns Map< uieName => UIEPlan[] > as object
    oneUIEWithInvalidDataTestCasesAndTheOthersWithValid( map: TestAnalysisMap, targetUIEName: string ): object {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {
            obj[ uieName ] = [];
            let sameUIE = uieName === targetUIEName;
            for ( let [ dtc, pair ] of dtcMap ) {
                if ( sameUIE ) {
                    if ( DTCAnalysisResult.INVALID === pair.first ) {
                        obj[ uieName ].push( new UIETestPlan( dtc, pair.first, pair.second ) );
                    }
                } else if ( DTCAnalysisResult.VALID === pair.first ) {
                    obj[ uieName ].push( new UIETestPlan( dtc, pair.first, pair.second ) );
                }
            }
        }
        return obj;
    }

    // Returns Array< Map< uieName => UIEPlan[] > > as object[]
    arrayOfOneUIEWithInvalidDataTestCasesAndTheOthersWithValid( map: TestAnalysisMap ): object[] {
        let all = [];
        for ( let [ uieName, dtcMap ] of map ) {
            let obj = this.oneUIEWithInvalidDataTestCasesAndTheOthersWithValid( map, uieName );
            all.push( obj );
        }
        return all;
    }

    // Returns Map< uieName => UIEPlan[] > as object
    allUIEWithInvalidDataTestCases( map: TestAnalysisMap ): object {
        let obj = {};
        for ( let [ uieName, dtcMap ] of map ) {
            obj[ uieName ] = [];
            for ( let [ dtc, pair ] of dtcMap ) {
                if ( DTCAnalysisResult.INVALID === pair.first ) {
                    obj[ uieName ].push( new UIETestPlan( dtc, pair.first, pair.second ) );
                }
            }
        }
        return obj;
    }
}