"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A test plan can be applied to test scenarios to produce test cases.
 *
 * @author Thiago Delgado Pinto
 */
class TestPlan {
    constructor() {
        /**
         * DataTestCases to apply for each UI Element variable in a test scenario.
         */
        this.dataTestCases = new Map();
    }
    /**
     * Indicates whether at least one of the DataTestCases generates an invalid data.
     * This can determine if oracles should exist to replace Then steps.
     */
    hasAnyInvalidResult() {
        for (let [uieVar, uiePlan] of this.dataTestCases) {
            if (uiePlan.isResultInvalid()) {
                return true;
            }
        }
        return false;
    }
}
exports.TestPlan = TestPlan;
//# sourceMappingURL=TestPlan.js.map