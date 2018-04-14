import { DataTestCase } from "../testdata/DataTestCase";
import { Step } from "../ast/Step";
import { UIETestPlan } from "./UIETestPlan";

/**
 * A test plan can be applied to test scenarios to produce test cases.
 *
 * @author Thiago Delgado Pinto
 */
export class TestPlan {

    /**
     * DataTestCases to apply for each UI Element variable in a test scenario.
     */
    dataTestCases: Map< string, UIETestPlan > = new Map< string, UIETestPlan >();

    // /**
    //  * Indicates that all the values to apply are valid.
    //  */
    // allValid: boolean = false;

    /**
     * A test should fail when all these conditions apply:
     *   - The Variant has one or more Then sentences that do not produce states
     *   - The DataTestCase explores a constraint (rule) of a UI Element property
     *   - The referred UI Element property has no Otherwise sentences
     *
     * That is, the Variant's postconditions will not be replaced by
     * Otherwise statements and it is expected that the system will behave
     * differently from its postconditions declare, making the test fail.
     * So, since it is expected that the test will fail, it should pass.
     */
    fail: boolean = false;

    /**
     * Maps a UI Element variable to the corresponding Otherwise steps that correspond
     * to the applied DataTestCase. If there is no Otherwise steps, `fail` is set to true
     * and original Postconditions steps from the Variant - expect for those that generate
     * state - are used instead.
     *
     * When the Variant has no Postconditions except for those that generate state and
     * the UI Element property has no Otherwise steps, `fail` is **not** set to `true`,
     * because there are no expectations about how the system should behave.
     */
    oracles: Map< string, Step[] > = new Map< string, Step[] >();
}
