"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arrayMove = require("array-move");
const deepcopy = require("deepcopy");
const nlp_1 = require("concordialang-types/nlp");
const NodeTypes_1 = require("../req/NodeTypes");
const TypeChecking_1 = require("../util/TypeChecking");
const CaseConversor_1 = require("../util/CaseConversor");
const CaseType_1 = require("../app/CaseType");
class StepUtil {
    /**
     * Move precondition steps to the beginning of the array, after other precondition steps.
     * When there is a GIVEN step followed by an AND step, and the GIVEN needs to be moved,
     * the AND step is changed to become a GIVEN step.
     *
     * @param steps Steps to analyze
     */
    movePreconditionStepsToTheBeginning(steps, keywords) {
        const nlpUtil = new nlp_1.NLPUtil();
        let lastWasGiven = null;
        let index = 0, preconditionCount = 0;
        const stepCount = steps.length;
        let newSteps = deepcopy(steps); // << important
        for (let step of steps) {
            if (NodeTypes_1.NodeTypes.STEP_GIVEN === step.nodeType
                || (NodeTypes_1.NodeTypes.STEP_AND == step.nodeType && true === lastWasGiven)) {
                const hasPrecondition = TypeChecking_1.isDefined(step.nlpResult)
                    && nlpUtil.hasEntityNamed(nlp_1.Entities.STATE, step.nlpResult);
                if (hasPrecondition) {
                    // Does not have prior GIVEN ? -> Make it a GIVEN
                    if (preconditionCount < 1) {
                        newSteps[index].nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
                    }
                    if (preconditionCount != index) {
                        arrayMove.mut(newSteps, index, preconditionCount);
                    }
                    // Is the next step an AND step ?
                    if (index + 1 < stepCount && newSteps[index + 1].nodeType === NodeTypes_1.NodeTypes.STEP_AND) {
                        let nextStep = newSteps[index + 1];
                        // Make it a GIVEN step
                        nextStep.nodeType = NodeTypes_1.NodeTypes.STEP_GIVEN;
                        // Change the sentence content!
                        if (!!nextStep.content) {
                            const stepAndKeyword = (keywords.stepAnd || ['and'])[0];
                            const stepGivenKeyword = (keywords.stepGiven || ['given'])[0];
                            const regex = new RegExp(stepAndKeyword, 'i');
                            nextStep.content = nextStep.content.replace(regex, CaseConversor_1.convertCase(stepGivenKeyword, CaseType_1.CaseType.PASCAL)); // Given ...
                        }
                    }
                    ++preconditionCount;
                }
                lastWasGiven = true;
            }
            else {
                lastWasGiven = false;
            }
            ++index;
        }
        return newSteps;
    }
}
exports.StepUtil = StepUtil;
