"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepcopy = require("deepcopy");
/**
 * Test Scenario combinator
 *
 * @author Thiago Delgado Pinto
 */
class TestScenarioCombinator {
    combine(baseTestScenario, allTestScenariosToCombine) {
        let all = [];
        for (let tsc of allTestScenariosToCombine) {
            let ts = this.cloneTestScenario(baseTestScenario);
            for (let pair of tsc) {
                const [state, stateTS] = pair.toArray();
                this.replaceStepWithTestScenario(ts, state.stepIndex, stateTS);
            }
        }
        return all;
    }
    cloneTestScenario(ts) {
        return deepcopy(ts);
    }
    replaceStepWithTestScenario(from, stepIndex, stepReplacer) {
        from.steps.splice(stepIndex, 1, ...stepReplacer.steps);
    }
}
exports.TestScenarioCombinator = TestScenarioCombinator;
//# sourceMappingURL=TestScenarioCombinator.js.map