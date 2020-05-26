import { SyntaxRule } from "./SyntaxRule";

/**
 * Rule Builder.
 *
 * @author Thiago Delgado Pinto
 */
export class SyntaxRuleBuilder {

    /**
     * Creates an array of rules applying the default rule to each object,
     * and then applying the partial rule.
     *
     * @param partialRules Partial rules.
     * @param defaultRule Default rule.
     * @return Array with rules.
     */
    public build(
        partialRules: Array< SyntaxRule >,
        defaultRule: SyntaxRule
    ): Array< SyntaxRule > {
        let rules = [];
        for ( let rule of partialRules ) {
            // Starts with the default rules
            let newRule = Object.assign( {}, defaultRule );
            // Then receives the new rules
            newRule = Object.assign( newRule, rule );
            rules.push( newRule );
        }
        return rules;
    }

}