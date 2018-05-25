"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * RuleBuilder.
 *
 * @author Thiago Delgado Pinto
 */
class RuleBuilder {
    /**
     * Creates an array of rules applying the default rule to each object,
     * and then applying the partial rule.
     *
     * @param partialRules Partial rules.
     * @param defaultRule Default rule.
     * @return Array with rules.
     */
    build(partialRules, defaultRule) {
        let rules = [];
        for (let rule of partialRules) {
            // Starts with the default rules
            let newRule = Object.assign({}, defaultRule);
            // Then receives the new rules
            newRule = Object.assign(newRule, rule);
            rules.push(newRule);
        }
        return rules;
    }
}
exports.RuleBuilder = RuleBuilder;
