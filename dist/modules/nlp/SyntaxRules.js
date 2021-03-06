"use strict";
//#region UI ACTION
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_PROPERTY_SYNTAX_RULES = exports.DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE = exports.UI_PROPERTY_SYNTAX_RULES = exports.DEFAULT_UI_PROPERTY_SYNTAX_RULE = exports.UI_ACTION_SYNTAX_RULES = exports.DEFAULT_UI_ACTION_SYNTAX_RULE = void 0;
/**
 * Default syntax rule for UI Actions.
 *
 * @author Thiago Delgado Pinto
 */
exports.DEFAULT_UI_ACTION_SYNTAX_RULE = {
    // Minimal number of targets it accepts (has precedence over all min values).
    minTargets: 1,
    // Maximal number of targets it accepts (has precedence over all max values).
    maxTargets: 1,
    // Accepted targets (NLP entities).
    //   When "maxTargets" is 1 and "targets" has more than one ui element, it accepts one OR another.
    //   When "maxTargets" > 1, the minimal of each target should be configured.
    targets: ["ui_element", "ui_literal", "value"],
    // Minimal and maximal values of each target.
    //   They will be considered only if they appear in "targets".
    //   If they do, they will should be *disconsidered* if:
    //     - min > minTargets
    //     - max > maxTargets
    ui_element: { min: 1, max: 999 },
    ui_literal: { min: 1, max: 999 },
    ui_property_ref: { min: 1, max: 999 },
    value: { min: 1, max: 999 },
    number: { min: 1, max: 999 },
    constant: { min: 1, max: 999 },
    state: { min: 1, max: 1 },
    command: { min: 1, max: 1 },
    // Other action or actions that must be used together.
    mustBeUsedWith: []
};
/**
 * Syntax rules for the supported UI Actions. Every rule overwrites DEFAULT_UI_ACTION_SYNTAX_RULE.
 *
 * TO-DO: Replace raw values by constants in Actions class, etc.
 *
 * @author Thiago Delgado Pinto
 */
exports.UI_ACTION_SYNTAX_RULES = [
    { name: "accept", minTargets: 0, maxTargets: 0 },
    { name: "amOn", minTargets: 1, maxTargets: 1, targets: [
            "ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"
        ] },
    { name: "append", targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        minTargets: 1, maxTargets: 999,
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "attachFile", minTargets: 1, maxTargets: 2, targets: [
            "ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"
        ] },
    { name: "cancel", minTargets: 0, maxTargets: 0 },
    { name: "check", minTargets: 1, maxTargets: 2,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 2 },
        ui_literal: { min: 0, max: 2 },
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "clear", minTargets: 1, maxTargets: 999, targets: ["ui_element", "ui_literal", "value", "number", "constant"] },
    { name: "click", minTargets: 1, maxTargets: 999,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 999 },
        ui_literal: { min: 0, max: 999 },
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "close", minTargets: 0 },
    { name: "connect", minTargets: 0, maxTargets: 1,
        targets: ["constant"],
        constant: { min: 1, max: 1 }
    },
    { name: "disconnect", minTargets: 1, maxTargets: 1,
        targets: ["constant"],
        constant: { min: 1, max: 1 }
    },
    { name: "doubleClick", minTargets: 1, maxTargets: 999,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 999 },
        ui_literal: { min: 0, max: 999 },
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "drag", minTargets: 2, maxTargets: 2, targets: ["ui_element", "ui_literal"] },
    { name: "fill", minTargets: 0, maxTargets: 999,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 999 },
        ui_literal: { min: 0, max: 999 },
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "hide", minTargets: 0 },
    { name: "install", minTargets: 1, maxTargets: 1, targets: ["value", "constant", "ui_property_ref"] },
    { name: "maximize", minTargets: 0 },
    { name: "move", minTargets: 1, maxTargets: 3,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 1 },
        ui_literal: { min: 0, max: 1 },
        value: { min: 0, max: 2 },
        number: { min: 0, max: 2 },
        constant: { min: 0, max: 2 },
        ui_property_ref: { min: 0, max: 2 }
    },
    { name: "open", minTargets: 0 },
    { name: "press", minTargets: 1, maxTargets: 6, targets: ["value", "number", "constant"] },
    { name: "pull", minTargets: 2, maxTargets: 2, targets: ["value", "constant"] },
    { name: "refresh", minTargets: 0 },
    { name: "remove", minTargets: 1, maxTargets: 1, targets: ["value", "number", "constant", "ui_property_ref"] },
    { name: "resize", minTargets: 2, maxTargets: 2, targets: ["value", "number", "constant"] },
    { name: "rightClick", minTargets: 1, maxTargets: 999, targets: [
            "ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"
        ] },
    { name: "rotate", minTargets: 2, maxTargets: 2, targets: ["value", "number", "constant"] },
    { name: "run", minTargets: 1, maxTargets: 2,
        targets: ["value", "constant", "command"],
        value: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        command: { min: 0, max: 1 }
    },
    { name: "saveScreenshot", minTargets: 1, maxTargets: 1, targets: ["value", "constant", "ui_property_ref"] },
    { name: "scrollTo", minTargets: 1, maxTargets: 1,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 1 },
        ui_literal: { min: 0, max: 1 },
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "see", minTargets: 0, maxTargets: 3,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 1 },
        ui_literal: { min: 0, max: 1 },
        value: { min: 0, max: 2 },
        number: { min: 0, max: 2 },
        constant: { min: 0, max: 2 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "select", minTargets: 1, maxTargets: 2,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 1 },
        ui_literal: { min: 0, max: 1 },
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "shake", minTargets: 0 },
    { name: "swipe", minTargets: 1, maxTargets: 5,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 2 },
        ui_literal: { min: 0, max: 2 },
        value: { min: 0, max: 3 },
        number: { min: 0, max: 3 },
        constant: { min: 0, max: 3 },
        ui_property_ref: { min: 0, max: 3 }
    },
    { name: "switch", minTargets: 0, maxTargets: 3,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 3 },
        ui_literal: { min: 0, max: 3 }
    },
    { name: "tap", minTargets: 1, maxTargets: 999,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"]
    },
    { name: "uncheck", minTargets: 1, maxTargets: 2,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 2 },
        ui_literal: { min: 0, max: 2 },
        value: { min: 0, max: 1 },
        number: { min: 0, max: 1 },
        constant: { min: 0, max: 1 },
        ui_property_ref: { min: 0, max: 1 }
    },
    { name: "uninstall", minTargets: 1, maxTargets: 1, targets: ["value", "constant", "ui_property_ref"] },
    { name: "wait",
        minTargets: 1, maxTargets: 3,
        targets: ["ui_element", "ui_literal", "value", "number", "constant", "ui_property_ref"],
        ui_element: { min: 0, max: 1 },
        ui_literal: { min: 0, max: 1 },
        value: { min: 0, max: 2 },
        number: { min: 0, max: 2 },
        constant: { min: 0, max: 2 },
        ui_property_ref: { min: 0, max: 2 }
    }
];
//#endregion
//#region UI PROPERTY
/**
 * Default syntax rule for UI Properties.
 *
 * @author Thiago Delgado Pinto
 */
exports.DEFAULT_UI_PROPERTY_SYNTAX_RULE = {
    // Minimal number of targets it accepts (has precedence over all min values).
    minTargets: 1,
    // Maximal number of targets it accepts (has precedence over all max values).
    maxTargets: 1,
    // Accepted targets (NLP entities).
    //   When "maxTargets" is 1 and "targets" has more than one ui element, it accepts one OR another.
    //   When "maxTargets" > 1, the minimal of each target should be configured.
    targets: ["value"],
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
    command: { min: 1, max: 1 },
    // Other action or actions that must be used together.
    mustBeUsedWith: []
};
/**
 * Syntax rules for the supported UI Properties. Every rule overwrites DEFAULT_UI_PROPERTY_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
exports.UI_PROPERTY_SYNTAX_RULES = [
    { name: "id", targets: ["value", "command"] },
    { name: "type", targets: ["ui_property"] },
    { name: "editable", targets: ["bool_value", "number"], minTargets: 0 },
    { name: "datatype", targets: ["ui_data_type"] },
    { name: "value", targets: ["value", "number", "query", "constant", "value_list"] },
    { name: "minlength", targets: ["number", "constant"] },
    { name: "maxlength", targets: ["number", "constant"] },
    { name: "minvalue", targets: ["number", "constant"] },
    { name: "maxvalue", targets: ["value", "number", "constant"] },
    { name: "format", targets: ["value", "constant"] },
    { name: "required", targets: ["bool_value", "number"], minTargets: 0 } // target not needed
];
//#endregion
//#region DATABASE PROPERTY
/**
 * Default syntax rule for Database Properties.
 *
 * @author Thiago Delgado Pinto
 */
exports.DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE = {
    // Minimal number of targets it accepts (has precedence over all min values).
    minTargets: 1,
    // Maximal number of targets it accepts (has precedence over all max values).
    maxTargets: 1,
    // Accepted targets (NLP entities).
    //   When "maxTargets" is 1 and "targets" has more than one ui element, it accepts one OR another.
    //   When "maxTargets" > 1, the minimal of each target should be configured.
    targets: ["value"],
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
exports.DATABASE_PROPERTY_SYNTAX_RULES = [
    { name: "type", targets: ["value"] },
    { name: "path", targets: ["value"] },
    { name: "name", targets: ["value"] },
    { name: "host", targets: ["value"] },
    { name: "port", targets: ["value", "number"] },
    { name: "username", targets: ["value"] },
    { name: "password", targets: ["value"] },
    { name: "charset", targets: ["value"] },
    { name: "options", targets: ["value"] }
];
//#endregion
