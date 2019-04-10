import { Step } from "concordialang-types";
// import * as deepcopy from 'deepcopy';

/**
 * Test Scenario
 *
 * @author Thiago Delgado Pinto
 */
export class TestScenario {

    /**
     * When the respective Feature or Variant has a tag `ignore`,
     * the Test Scenario must be ignored for Test Case generation.
     * Even though, it can be used to replace preconditions' states
     * and state calls.
     */
    ignoreForTestCaseGeneration: boolean = false;

    /**
     * Step after state preconditions. Precondition steps must be
     * the first ones in a Variant. So this makes a reference to
     * the step after all preconditions, in order to allow ignoring
     * them, which is needed for State Calls.
     */
    stepAfterPreconditions: Step = null;


    steps: Step[] = [];


    clone(): TestScenario {
        let ts = new TestScenario();
        ts.steps = this.steps.slice( 0 ); // copy the array, but do not clone the steps
        ts.ignoreForTestCaseGeneration = this.ignoreForTestCaseGeneration;
        ts.stepAfterPreconditions = this.stepAfterPreconditions;
        return ts;
        // let ts = new TestScenario();
        // ts.steps = [];
        // for ( let step of this.steps ) {
        //     ts.steps.push( deepcopy( step ) as Step );
        // }
        // ts.ignoreForTestCaseGeneration = this.ignoreForTestCaseGeneration;
        // const stepIndex = this.steps.indexOf( this.stepAfterPreconditions );
        // ts.stepAfterPreconditions = stepIndex < 0 ? null : ts.steps[ stepIndex ];
        // return ts;
    }

    stepsWithoutPreconditions(): Step[] {
        if ( null === this.stepAfterPreconditions ) {
            return this.steps;
        }
        let subset: Step[] = [];
        let canAdd: boolean = false;
        for ( let step of this.steps ) {
            if ( ! canAdd && step === this.stepAfterPreconditions ) {
                canAdd = true;
            }
            if ( canAdd ) {
                subset.push( step );
            }
        }
        return subset;
    }

}