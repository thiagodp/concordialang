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
    //   When "maxTargets" is 1 and "targets" has more than one ui element, it accepts one OR another.
    //   When "maxTargets" > 1, the minimal of each target should be configured.
    targets: [ "ui_element", "ui_literal", "value" ],

    // Minimal and maximal values of each target.
    //   They will be considered only if they appear in "targets".
    //   If they do, they will should be *disconsidered* if:
    //     - min > minTargets
    //     - max > maxTargets
    ui_element: { min: 1, max: 999 },
    ui_literal: { min: 1, max: 999 },
    value: { min: 1, max: 999 },
    number: { min: 1, max: 999 },
    constant: { min: 1, max: 999 },
    state: { min: 1, max: 1 },

    // Other action or actions that must be used together.
    mustBeUsedWith: []
};

/**
 * Syntax rules for the supported UI Actions. Every rule overwrites DEFAULT_UI_ACTION_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
export const UI_ACTION_SYNTAX_RULES = [
    { name: "amIn", targets: [ "ui_element", "ui_literal", "value", "number", "constant" ] },
    { name: "append" },
    { name: "attachFile" },
    { name: "check", maxTargets: 999 },
    { name: "clear", maxTargets: 999 },
    { name: "click", maxTargets: 999 },
    { name: "close" },
    { name: "doubleClick" },
    { name: "drag", mustBeUsedWith: [ "drop" ] },
    { name: "drop", mustBeUsedWith: [ "drag" ] },
    { name: "fill", maxTargets: 999, minTargets: 0, value: { min: 0, max: 1 }, number: { min: 0, max: 1 } },
    { name: "hide", maxTargets: 999 },
    { name: "move", minTargets: 1, maxTargets: 3,
        targets: [ "ui_element", "ui_literal", "value", "number", "constant" ],
        ui_element: { min: 1, max: 1 },
        ui_literal: { min: 1, max: 1 },
        value: { min: 1, max: 1 },
        number: { min: 1, max: 1 },
        constant: { min: 1, max: 1 }
    },
    { name: "open" },
    { name: "press", targets: [ "value" ], maxTargets: 5 },
    { name: "refresh" },
    { name: "see",  maxTargets: 2,
        targets: [ "ui_element", "ui_literal", "value", "number", "constant" ],
        ui_element: { min: 0, max: 1 },
        ui_literal: { min: 0, max: 1 },
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 }
    },
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
    //   When "maxTargets" is 1 and "targets" has more than one ui element, it accepts one OR another.
    //   When "maxTargets" > 1, the minimal of each target should be configured.
    targets: [ "value" ],

    // Minimal and maximal values of each target.
    //   They will be considered only if they appear in "targets".
    //   If they do, they will should be *disconsidered* if:
    //     - min > minTargets
    //     - max > maxTargets
    value: { min: 1, max: 1 },

    value_list: { min: 1, max: 1 },

    number: { min: 1, max: 1 },

    constant: { min: 1, max: 1 },

    query: { min: 1, max: 1 },

    ui_property: { min: 1, max: 1 },

    ui_data_type: { min: 1, max: 1 },

    bool_value: { min: 1, max: 1 },

    // Other action or actions that must be used together.
    mustBeUsedWith: []
};

/**
 * Syntax rules for the supported UI Properties. Every rule overwrites DEFAULT_UI_PROPERTY_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
export const UI_PROPERTY_SYNTAX_RULES = [
    { name: "id", targets: [ "value" ] },
    { name: "type", targets: [ "ui_property" ] },
    { name: "editable", targets: [ "bool_value", "number" ], minTargets: 0 }, // target not needed
    { name: "datatype", targets: [ "ui_data_type" ] }, // e.g. string, integer, ...
    { name: "value", targets: [ "value", "number", "query", "constant" ] },
    { name: "minlength", targets: [ "number", "constant" ] },
    { name: "maxlength", targets: [ "number", "constant" ] },
    { name: "minvalue", targets: [ "number", "constant" ] },
    { name: "maxvalue", targets: [ "value", "number", "constant" ] },
    { name: "format", targets: [ "value", "constant" ] },
    { name: "required", targets: [ "bool_value", "number" ], minTargets: 0 } // target not needed
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
    //   When "maxTargets" is 1 and "targets" has more than one ui element, it accepts one OR another.
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
 * Syntax rules for the supported Database Properties. Every rule overwrites DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE.
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