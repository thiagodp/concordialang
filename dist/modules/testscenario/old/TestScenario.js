"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestScenario {
    constructor(ref, steps = []) {
        this.ref = ref;
        this.steps = steps;
        /**
         * When the respective Feature or Variant has a tag `ignore`,
         * the Test Scenario must be ignored for Test Case generation.
         **/
        this.ignoreForTestCaseGeneration = false;
        /**
         * Step after state preconditions. Precondition steps must be
         * the first ones in a Variant. So this makes a reference to
         * the step after all preconditions, in order to allow ignoring
         * them, which is needed for State Calls.
         */
        this.stepAfterPreconditions = null;
    }
    stepsWithoutPreconditions() {
        if (null === this.stepAfterPreconditions) {
            return this.steps;
        }
        let subset = [];
        let canAdd = false;
        for (let step of this.steps) {
            if (!canAdd && step === this.stepAfterPreconditions) {
                canAdd = true;
            }
            if (canAdd) {
                subset.push(step);
            }
        }
        return subset;
    }
}
exports.TestScenario = TestScenario;
//# sourceMappingURL=TestScenario.js.map