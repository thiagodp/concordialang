"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Pre Test Case
 *
 * @author Thiago Delgado Pinto
 */
class PreTestCase {
    constructor(testPlan, steps = [], oracles = [], // Otherwise steps
    correspondingOracles = []) {
        this.testPlan = testPlan;
        this.steps = steps;
        this.oracles = oracles;
        this.correspondingOracles = correspondingOracles;
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
    hasAnyThenStep() {
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
        // return this.hasAnyThenStep()
        //     && this.hasAnyInvalidValue()
        //     && ! this.hasOracles();
        if (!this.hasAnyThenStep) {
            return false;
        }
        for (let step of this.steps) {
            // Is it invalid && it does not have otherwise steps
            if (step.isInvalidValue && !this.hasCorrespondingOracles(step)) {
                return true;
            }
        }
        return false;
    }
    hasCorrespondingOracles(step) {
        return !!this.correspondingOracles.find(c => c.step === step);
    }
}
exports.PreTestCase = PreTestCase;
