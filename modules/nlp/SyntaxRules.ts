//#region UI ACTION

/**
 * Default syntax rule for UI Actions.
 * 
 * @author Thiago Delgado Pinto
 */
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

/**
 * Syntax rules for the supported UI Actions.
 * 
 * @author Thiago Delgado Pinto
 */
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

//#endregion

//#region UI PROPERTY

/**
 * Default syntax rule for UI Properties.
 * 
 * @author Thiago Delgado Pinto
 */
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

    ui_property: { min: 1, max: 1 },

    number: { min: 1, max: 1 },    

    query: { min: 1, max: 1 },

    ui_data_type: { min: 1, max: 1 },

    // Other action or actions that must be used together.
    mustBeUsedWith: []    
};

/**
 * Syntax rules for the supported UI Properties.
 * 
 * @author Thiago Delgado Pinto
 */
export const UI_PROPERTY_SYNTAX_RULES = [
    { name: "id", targets: [ "value" ] },
    { name: "type", targets: [ "ui_property" ] },
    { name: "datatype", targets: [ "ui_data_type" ] }, // e.g. string, integer, ...
    { name: "value", targets: [ "value", "number", "query" ] },
    { name: "minlength", targets: [ "number" ] },
    { name: "maxlength", targets: [ "number" ] },
    { name: "minvalue", targets: [ "number" ] },
    { name: "maxvalue", targets: [ "value", "number" ] },
    { name: "format", targets: [ "value" ] },
    //...
];

//#endregion

//#region DATABASE PROPERTY

/**
 * Default syntax rule for Database Properties.
 * 
 * @author Thiago Delgado Pinto
 */
export const DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE = {
    
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

    number: { min: 1, max: 1 },

    // Other action or actions that must be used together.
    mustBeUsedWith: []    
};

/**
 * Syntax rules for the supported Database Properties.
 * 
 * @author Thiago Delgado Pinto
 */
export const DATABASE_PROPERTY_SYNTAX_RULES = [
    { name: "type", targets: [ "value" ] },    
    { name: "path", targets: [ "value" ] },
    { name: "name", targets: [ "value" ] },
    { name: "host", targets: [ "value" ] },
    { name: "port", targets: [ "value", "number" ] },
    { name: "username", targets: [ "value" ] },
    { name: "password", targets: [ "value" ] },
    { name: "charset", targets: [ "value" ] },
    { name: "options", targets: [ "value" ] }
];

//#endregion