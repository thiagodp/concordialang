"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI_PROPERTY_SYNTAX_RULES = exports.DEFAULT_UI_PROPERTY_SYNTAX_RULE = void 0;
const ast_1 = require("../../ast");
const Entities_1 = require("../Entities");
const UIP_RULES = {
    minTargets: 1,
    maxTargets: 1,
    targets: [Entities_1.Entities.VALUE],
};
UIP_RULES[Entities_1.Entities.VALUE] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.VALUE_LIST] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.NUMBER] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.CONSTANT] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.QUERY] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.UI_PROPERTY] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.UI_DATA_TYPE] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.BOOL_VALUE] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.COMMAND] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.DATE] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.TIME] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.DATE_TIME] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.LONG_TIME] = { min: 1, max: 1 };
UIP_RULES[Entities_1.Entities.LONG_DATE_TIME] = { min: 1, max: 1 };
/**
 * Default syntax rule for UI Properties.
 *
 * @author Thiago Delgado Pinto
 */
exports.DEFAULT_UI_PROPERTY_SYNTAX_RULE = UIP_RULES;
/**
 * Syntax rules for the supported UI Properties.
 *
 * Every rule overwrites DEFAULT_UI_PROPERTY_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
exports.UI_PROPERTY_SYNTAX_RULES = [
    { name: ast_1.UIPropertyTypes.ID,
        targets: [
            Entities_1.Entities.VALUE,
            Entities_1.Entities.COMMAND
        ] },
    { name: ast_1.UIPropertyTypes.TYPE,
        targets: [
            Entities_1.Entities.UI_PROPERTY
        ] },
    { name: ast_1.UIPropertyTypes.EDITABLE,
        targets: [
            Entities_1.Entities.BOOL_VALUE,
            Entities_1.Entities.NUMBER
        ],
        minTargets: 0 },
    { name: ast_1.UIPropertyTypes.DATA_TYPE,
        targets: [
            Entities_1.Entities.UI_DATA_TYPE // e.g. string, integer, ...
        ] },
    { name: ast_1.UIPropertyTypes.VALUE,
        targets: [
            Entities_1.Entities.VALUE,
            Entities_1.Entities.NUMBER,
            Entities_1.Entities.CONSTANT,
            Entities_1.Entities.QUERY,
            Entities_1.Entities.VALUE_LIST,
            Entities_1.Entities.TIME,
            Entities_1.Entities.DATE_TIME,
            Entities_1.Entities.LONG_TIME,
            Entities_1.Entities.LONG_DATE_TIME
        ] },
    { name: ast_1.UIPropertyTypes.MIN_LENGTH,
        targets: [
            Entities_1.Entities.NUMBER,
            Entities_1.Entities.CONSTANT,
            Entities_1.Entities.QUERY,
        ] },
    { name: ast_1.UIPropertyTypes.MAX_LENGTH,
        targets: [
            Entities_1.Entities.NUMBER,
            Entities_1.Entities.CONSTANT,
            Entities_1.Entities.QUERY,
        ] },
    { name: ast_1.UIPropertyTypes.MIN_VALUE,
        targets: [
            Entities_1.Entities.VALUE,
            Entities_1.Entities.NUMBER,
            Entities_1.Entities.CONSTANT,
            Entities_1.Entities.QUERY,
            Entities_1.Entities.DATE,
            Entities_1.Entities.TIME,
            Entities_1.Entities.DATE_TIME,
            Entities_1.Entities.LONG_TIME,
            Entities_1.Entities.LONG_DATE_TIME
        ] },
    { name: ast_1.UIPropertyTypes.MAX_VALUE,
        targets: [
            Entities_1.Entities.VALUE,
            Entities_1.Entities.NUMBER,
            Entities_1.Entities.CONSTANT,
            Entities_1.Entities.QUERY,
            Entities_1.Entities.DATE,
            Entities_1.Entities.TIME,
            Entities_1.Entities.DATE_TIME,
            Entities_1.Entities.LONG_TIME,
            Entities_1.Entities.LONG_DATE_TIME
        ] },
    { name: ast_1.UIPropertyTypes.FORMAT,
        targets: [
            Entities_1.Entities.VALUE,
            Entities_1.Entities.CONSTANT
        ] },
    { name: ast_1.UIPropertyTypes.REQUIRED,
        targets: [
            Entities_1.Entities.BOOL_VALUE,
            Entities_1.Entities.NUMBER
        ],
        minTargets: 0 },
    { name: ast_1.UIPropertyTypes.LOCALE,
        targets: [
            Entities_1.Entities.VALUE,
            Entities_1.Entities.CONSTANT
        ] },
    { name: ast_1.UIPropertyTypes.LOCALE_FORMAT,
        targets: [
            Entities_1.Entities.VALUE,
            Entities_1.Entities.CONSTANT
        ] },
];
