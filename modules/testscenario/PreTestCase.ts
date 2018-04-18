import { Step } from "../ast/Step";
import { NodeTypes } from "../req/NodeTypes";
import { TestPlan } from "../testcase/TestPlan";

/**
 * Pre Test Case
 *
 * @author Thiago Delgado Pinto
 */
export class PreTestCase {

    constructor(
        public testPlan: TestPlan,
        public steps: Step[] = [],
        public oracles: Step[] = []
    ) {
    }

    hasAnyInvalidValue(): boolean {
        return this.testPlan.hasAnyInvalidResult();
    }

    firstThenStep(): Step | null {
        for ( let step of this.steps || [] ) {
            if ( NodeTypes.STEP_THEN === step.nodeType ) {
                return step;
            }
        }
        return null;
    }

    hasThenStep(): boolean {
        return this.firstThenStep() !== null;
    }

    hasOracles(): boolean {
        return ! this.oracles && this.oracles.length > 0;
    }

    shouldFail(): boolean {
        return this.hasThenStep()
            && this.hasAnyInvalidValue()
            && ! this.hasOracles();
    }


    // /**
    //  * A test should fail when all these conditions apply:
    //  *   - The Variant has one or more Then sentences that do not produce states
    //  *   - The DataTestCase explores a constraint (rule) of a UI Element property
    //  *   - The referred UI Element property has no Otherwise sentences
    //  *
    //  * That is, the Variant's postconditions will not be replaced by
    //  * Otherwise statements and it is expected that the system will behave
    //  * differently from its postconditions declare, making the test fail.
    //  * So, since it is expected that the test will fail, it should pass.
    //  */
    // fail: boolean = false;

    // /**
    //  * Maps a UI Element variable to the corresponding Otherwise steps that correspond
    //  * to the applied DataTestCase. If there is no Otherwise steps, `fail` is set to true
    //  * and original Postconditions steps from the Variant - expect for those that generate
    //  * state - are used instead.
    //  *
    //  * When the Variant has no Postconditions except for those that generate state and
    //  * the UI Element property has no Otherwise steps, `fail` is **not** set to `true`,
    //  * because there are no expectations about how the system should behave.
    //  */
    // oracles: Map< string, Step[] > = new Map< string, Step[] >();

}