/**
 * Syntax rules.
 * 
 * @author Thiago Delgado Pinto
 */


/**
 * RuleBuilder.
 * 
 * @author Thiago Delgado Pinto
 */
export class RuleBuilder {

    /**
     * Creates an array of rules applying the default rule to each object,
     * and then applying the partial rule.
     * 
     * @param partialRules Partial rules.
     * @param defaultRule Default rule.
     * @return Array with rules.
     */
    public build( partialRules: object[], defaultRule: object ): object[] {
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


 // This syntax rule will be the default for all UI Actions.
export const DEFAULT_UI_ACTION_SYNTAX_RULE = {

    // Minimal number of targets it accepts (has precedence over all min values).
    minTargets: 1,
    // Maximal number of targets it accepts (has precedence over all max values).
    maxTargets: 1,

    // Accepted targets (NLP entities).
    //   When "maxTargets" is 1 and "targets" has more than one element, it accepts one OR another.
    //   When "maxTargets" > 1, the minimal of each target should be configured.
    targets: [ "element", "value" ],

    // Minimal and maximal values of each target.
    //   They will be considered only if they appear in "targets".
    //   If they do, they will should be *disconsidered* if:
    //     - min > minTargets
    //     - max > maxTargets
    element: { min: 1, max: 999 },
    value: { min: 1, max: 999 },
    number: { min: 1, max: 999 },

    // Other action or actions that must be used together.
    mustBeUsedWith: []    
};


// Syntax rules for the supported UI Actions
export const UI_ACTION_SYNTAX_RULES = [
    { name: "append" },
    { name: "attachFile" },
    { name: "check", maxTargets: 999 },
    { name: "clear", maxTargets: 999 },
    { name: "click", maxTargets: 999 },
    { name: "close" },
    { name: "doubleClick" },
    { name: "drag", mustBeUsedWith: [ "drop" ] },
    { name: "drop", mustBeUsedWith: [ "drag" ] },
    { name: "fill", maxTargets: 999, value: { min: 0, max: 1 } },
    { name: "hide", maxTargets: 999 },
    { name: "move", minTargets: 1, maxTargets: 3, targets: [ "element", "number" ], element: { min: 1, max: 1 }, number: { min: 0, max: 2 } },
    { name: "open" },
    { name: "press", targets: [ "value" ], maxTargets: 5 },
    { name: "refresh" },
    //...
];


 // This syntax rule will be the default for all the properties of UI Elements.
 export const DEFAULT_UI_PROPERTY_SYNTAX_RULE = {
    
        // Minimal number of targets it accepts (has precedence over all min values).
        minTargets: 1,
        // Maximal number of targets it accepts (has precedence over all max values).
        maxTargets: 1,
    
        // Accepted targets (NLP entities).
        //   When "maxTargets" is 1 and "targets" has more than one element, it accepts one OR another.
        //   When "maxTargets" > 1, the minimal of each target should be configured.
        targets: [ "value" ],
    
        // Minimal and maximal values of each target.
        //   They will be considered only if they appear in "targets".
        //   If they do, they will should be *disconsidered* if:
        //     - min > minTargets
        //     - max > maxTargets
        value: { min: 1, max: 1 },

        ui_element_type: { min: 1, max: 1 },

        number: { min: 1, max: 1 },    

        query: { min: 1, max: 1 },

        datatype: { min: 1, max: 1 },
    
        // Other action or actions that must be used together.
        mustBeUsedWith: []    
    };

// Syntax rules for the supported properties of UI Elements
export const UI_PROPERTY_SYNTAX_RULES = [
    { name: "id", targets: [ "value" ] },
    { name: "type", targets: [ "ui_element_type" ] },
    { name: "datatype", targets: [ "datatype" ] }, // e.g. string, integer, ...
    { name: "value", targets: [ "value", "number", "query" ] },
    { name: "minlength", targets: [ "number" ] },
    { name: "maxlength", targets: [ "number" ] },
    { name: "minvalue", targets: [ "number" ] },
    { name: "maxvalue", targets: [ "value", "number" ] },
    { name: "format", targets: [ "value" ] },
    //...
];