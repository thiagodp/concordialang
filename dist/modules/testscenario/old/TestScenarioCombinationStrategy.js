"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cartesian = require("cartesian");
class AllCombinationsStrategy {
    /** @inheritDoc */
    combine(preconditionProducers, stateCallProducers) {
        let obj = {};
        for (let [state, infoList] of preconditionProducers) {
            obj[state] = infoList;
        }
        for (let [state, infoList] of stateCallProducers) {
            obj[state] = infoList;
        }
        let combinations = cartesian(obj);
        // ...
        return [];
        // let all: TestScenariosToCombine[] = [];
        // let preconditionTSMap = this.mapAllTestScenarios( preconditionProducers );
        // let stateCallTSMap = this.mapAllTestScenarios( stateCallProducers );
        // let allKeys: ImmutablePair< number, TestScenario[] >[] = []; // true means precondition
        // for ( let key of preconditionProducers.keys() ) {
        //     allKeys.push( new ImmutablePair( key.stepIndex, preconditionProducers ) );
        // }
        // for ( let key of stateCallProducers.keys() ) {
        //     allKeys.push( new ImmutablePair( key, false ) );
        // }
        // const allKeysCount = allKeys.length;
        // for ( let i = 0; i < allKeysCount; ++i ) {
        //     let testScenarios = allKeys[ i ].second ?
        //     //for ( let ts of  )
        //     let row: TestScenariosToCombine = [];
        //     for ( let j = i + 1; j < allKeysCount; ++j ) {
        //         allKeys[ i ]
        //     }
        // }
        // const numberOfPreconditions = preconditionProducers.keys.length;
        // const numberOfStateCalls = stateCallProducers.keys.length;
        // const statesPerRow = numberOfPreconditions + numberOfStateCalls;
        // let pcIndex = 0, scIndex = 0;
        // for ( let [ precondition, allPreconditionTS ] of preconditionTSMap ) {
        //     let row: TestScenariosToCombine;
        //     row.push( new ImmutablePair( precondition, allPreconditionTS[ pcIndex ] ) );
        //     ++pcIndex;
        // }
        // for ( let [ stateCall, allStateCallTS ] of stateCallTSMap ) {
        //     for ( let stateCallTS of allStateCallTS ) {
        //         row.push( new ImmutablePair( stateCall, stateCallTS ) );
        //         all.push( row );
        //     }
        // }
        // return all;
    }
}
exports.AllCombinationsStrategy = AllCombinationsStrategy;
