import { State } from '../ast';
import { Entities, NLPUtil } from '../nlp';
import { NodeTypes } from '../req/NodeTypes';
/**
 * Detects preconditions, state calls and postconditions.
 *
 * @author Thiago Delgado Pinto
 */
export class VariantStateDetector {
    /**
     * Detects State references and adds them to the given object.
     *
     * @param variantLike Variant-like object to be updated.
     */
    update(variantLike) {
        if (!variantLike) {
            return;
        }
        variantLike.preconditions = [];
        variantLike.stateCalls = [];
        variantLike.postconditions = [];
        // No sentences? -> exit
        if (!variantLike.sentences || variantLike.sentences.length < 1) {
            return;
        }
        // Analyzing detected entities of the steps
        const nlpUtil = new NLPUtil();
        let nodeType = null;
        let stepIndex = -1;
        for (let step of variantLike.sentences) {
            ++stepIndex;
            if (!step.nlpResult) {
                continue;
            }
            // Handles "AND" steps as the last Given/When/Then
            if (step.nodeType !== NodeTypes.STEP_AND &&
                step.nodeType !== NodeTypes.STEP_OTHERWISE) {
                nodeType = step.nodeType;
            }
            if (null === nodeType) { // Starts with AND
                continue;
            }
            let targetRef = null;
            switch (nodeType) {
                case NodeTypes.STEP_GIVEN:
                    targetRef = variantLike.preconditions;
                    break;
                case NodeTypes.STEP_WHEN:
                    targetRef = variantLike.stateCalls;
                    break;
                case NodeTypes.STEP_THEN:
                    targetRef = variantLike.postconditions;
                    break;
            }
            if (null === targetRef) {
                continue;
            }
            // Expected at most one state
            const stateNames = nlpUtil.valuesOfEntitiesNamed(Entities.STATE, step.nlpResult);
            for (const name of stateNames) {
                targetRef.push(new State(name, stepIndex));
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
