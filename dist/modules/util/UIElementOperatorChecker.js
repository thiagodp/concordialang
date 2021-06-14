import { Entities, NLPUtil } from '../nlp';
import { UIElementOperator, UIElementOperatorModifier } from './UIElementOperator';
/**
 * UI Element operator checker.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementOperatorChecker {
    constructor() {
        this.nlpUtil = new NLPUtil();
    }
    isEqualTo(uip) {
        return this.hasOperator(uip, UIElementOperator.EQUAL_TO) && !this.hasNot(uip);
    }
    isNotEqualTo(uip) {
        return this.hasOperator(uip, UIElementOperator.EQUAL_TO) && this.hasNot(uip);
    }
    isIn(uip) {
        return this.hasOperator(uip, UIElementOperator.IN) && !this.hasNot(uip);
    }
    isNotIn(uip) {
        return this.hasOperator(uip, UIElementOperator.IN) && this.hasNot(uip);
    }
    isComputedBy(uip) {
        return this.hasOperator(uip, UIElementOperator.COMPUTED_BY) && !this.hasNot(uip);
    }
    // Not accepted, but useful for validation
    isNotComputedBy(uip) {
        return this.hasOperator(uip, UIElementOperator.COMPUTED_BY) && this.hasNot(uip);
    }
    hasOperator(uip, operator) {
        return this.nlpUtil.valuesOfEntitiesNamed(Entities.UI_CONNECTOR, uip.nlpResult)
            .indexOf(operator) >= 0;
    }
    hasNot(uip) {
        return this.nlpUtil.valuesOfEntitiesNamed(Entities.UI_CONNECTOR_MODIFIER, uip.nlpResult)
            .indexOf(UIElementOperatorModifier.NOT) >= 0;
    }
}
