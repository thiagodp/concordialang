"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLPResult_1 = require("../nlp/NLPResult");
const UIElementOperator_1 = require("./UIElementOperator");
const Entities_1 = require("../nlp/Entities");
/**
 * UI Element operator checker.
 *
 * @author Thiago Delgado Pinto
 */
class UIElementOperatorChecker {
    constructor() {
        this.nlpUtil = new NLPResult_1.NLPUtil();
    }
    isEqualTo(uip) {
        return this.hasOperator(uip, UIElementOperator_1.UIElementOperator.EQUAL_TO) && !this.hasNot(uip);
    }
    isNotEqualTo(uip) {
        return this.hasOperator(uip, UIElementOperator_1.UIElementOperator.EQUAL_TO) && this.hasNot(uip);
    }
    isIn(uip) {
        return this.hasOperator(uip, UIElementOperator_1.UIElementOperator.IN) && !this.hasNot(uip);
    }
    isNotIn(uip) {
        return this.hasOperator(uip, UIElementOperator_1.UIElementOperator.IN) && this.hasNot(uip);
    }
    isComputedBy(uip) {
        return this.hasOperator(uip, UIElementOperator_1.UIElementOperator.COMPUTED_BY) && !this.hasNot(uip);
    }
    // Not accepted, but useful for validation
    isNotComputedBy(uip) {
        return this.hasOperator(uip, UIElementOperator_1.UIElementOperator.COMPUTED_BY) && this.hasNot(uip);
    }
    hasOperator(uip, operator) {
        return this.nlpUtil.valuesOfEntitiesNamed(Entities_1.Entities.UI_CONNECTOR, uip.nlpResult)
            .indexOf(operator) >= 0;
    }
    hasNot(uip) {
        return this.nlpUtil.valuesOfEntitiesNamed(Entities_1.Entities.UI_CONNECTOR_MODIFIER, uip.nlpResult)
            .indexOf(UIElementOperator_1.UIElementOperatorModifier.NOT) >= 0;
    }
}
exports.UIElementOperatorChecker = UIElementOperatorChecker;
//# sourceMappingURL=UIElementOperatorChecker.js.map