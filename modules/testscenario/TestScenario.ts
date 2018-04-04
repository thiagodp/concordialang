import { Step } from "../ast/Step";
import { VariantRef } from "./VariantRef";

export class TestScenario {

    /**
     * When the respective Feature or Variant has a tag `ignore`,
     * the Test Scenario must be ignored for Test Case generation.
     **/
    ignoreForTestCaseGeneration: boolean = false;

    /**
     * Step after state preconditions. Precondition steps must be
     * the first ones in a Variant. So this makes a reference to
     * the step after all preconditions, in order to allow ignoring
     * them, which is needed for State Calls.
     */
    stepAfterPreconditions: Step = null;

    constructor(
        public ref: VariantRef,
        public steps: Step[] = []
    ) {
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
