"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantStateDetector = void 0;
const ast_1 = require("../ast");
const nlp_1 = require("../nlp");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects preconditions, state calls and postconditions.
 *
 * @author Thiago Delgado Pinto
 */
class VariantStateDetector {
    /**
     * Detects State references and adds them to the given object.
     *
     * @param variantLike Variant or Variant Background object to be updated.
     */
    update(variantLike, isVariant) {
        // No sentences? -> Exit
        if (!variantLike || !variantLike.sentences || variantLike.sentences.length < 1) {
            return;
        }
        // Preparing the state references
        if (!variantLike.preconditions) {
            variantLike.preconditions = [];
        }
        if (!variantLike.stateCalls) {
            variantLike.stateCalls = [];
        }
        if (isVariant && !variantLike.postconditions) {
            variantLike.postconditions = [];
        }
        // Analysing detected entities of the steps
        const nlpUtil = new nlp_1.NLPUtil();
        let lastGWT = null;
        let stepIndex = -1;
        for (let step of variantLike.sentences) {
            ++stepIndex;
            if (!step.nlpResult) {
                continue;
            }
            // Handles "AND" steps as the last Given/When/Then
            if (step.nodeType !== NodeTypes_1.NodeTypes.STEP_AND && step.nodeType !== NodeTypes_1.NodeTypes.STEP_OTHERWISE) {
                lastGWT = step.nodeType;
            }
            if (null === lastGWT) {
                continue;
            }
            let targetStates = null;
            switch (lastGWT) {
                case NodeTypes_1.NodeTypes.STEP_GIVEN:
                    targetStates = variantLike.preconditions;
                    break;
                case NodeTypes_1.NodeTypes.STEP_WHEN:
                    targetStates = variantLike.stateCalls;
                    break;
                case NodeTypes_1.NodeTypes.STEP_THEN: {
                    targetStates = isVariant ? variantLike.postconditions : null;
                    break;
                }
            }
            if (null === targetStates) {
                continue;
            }
            const stateNames = nlpUtil.valuesOfEntitiesNamed(nlp_1.Entities.STATE, step.nlpResult);
            for (let name of stateNames) {
                targetStates.push(new ast_1.State(name, stepIndex));
            }
        }
    }
    /**
     * Returns the removed preconditions.
     */
    removePreconditionsThatRefersToPostconditions(variant) {
        let removed = [];
        for (let postc of variant.postconditions || []) {
            let index = 0;
            for (let prec of variant.preconditions || []) {
                if (prec.equals(postc)) {
                    removed.push(prec);
                    variant.preconditions.splice(index, 1);
                }
                ++index;
            }
        }
        return removed;
    }
}
exports.VariantStateDetector = VariantStateDetector;
