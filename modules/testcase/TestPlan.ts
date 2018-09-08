import { UIETestPlan } from './UIETestPlan';

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

    /**
     * Indicates whether at least one of the DataTestCases generates an invalid data.
     * This can determine if oracles should exist to replace Then steps.
     */
    hasAnyInvalidResult(): boolean {
        for ( let [ uieVar, uiePlan ] of this.dataTestCases ) {
            if ( uiePlan.isResultInvalid() ) {
                return true;
            }
        }
        return false;
    }

}
