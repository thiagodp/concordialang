"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Pre Test Case
 *
 * @author Thiago Delgado Pinto
 */
class PreTestCase {
    constructor(testPlan, steps = [], oracles = []) {
        this.testPlan = testPlan;
        this.steps = steps;
        this.oracles = oracles;
    }
    hasAnyInvalidValue() {
        return this.testPlan.hasAnyInvalidResult();
    }
    lastThenStep() {
        const len = (this.steps || []).length;
        for (let i = len - 1; i >= 0; --i) {
            let step = this.steps[i];
            if (NodeTypes_1.NodeTypes.STEP_THEN === step.nodeType) {
                return step;
            }
        }
        return null;
    }
    hasThenStep() {
        return this.lastThenStep() !== null;
    }
    stepsBeforeTheLastThenStep() {
        let lastThen = this.lastThenStep();
        if (null === lastThen) {
            return this.steps;
        }
        let stepsBeforeThen = [];
        for (let step of this.steps) {
            if (step === lastThen) {
                break;
            }
            stepsBeforeThen.push(step);
        }
        return stepsBeforeThen;
    }
    hasOracles() {
        return (this.oracles || []).length > 0;
    }
    shouldFail() {
        return this.hasThenStep()
            && this.hasAnyInvalidValue()
            && !this.hasOracles();
    }
}
exports.PreTestCase = PreTestCase;
//# sourceMappingURL=PreTestCase.js.map