import { UIPropertyTypes } from '../../ast';
import { Entities } from '../Entities';
const UIP_RULES = {
    minTargets: 1,
    maxTargets: 1,
    targets: [Entities.VALUE],
};
UIP_RULES[Entities.VALUE] = { min: 1, max: 1 };
UIP_RULES[Entities.VALUE_LIST] = { min: 1, max: 1 };
UIP_RULES[Entities.NUMBER] = { min: 1, max: 1 };
UIP_RULES[Entities.CONSTANT] = { min: 1, max: 1 };
UIP_RULES[Entities.QUERY] = { min: 1, max: 1 };
UIP_RULES[Entities.UI_PROPERTY] = { min: 1, max: 1 };
UIP_RULES[Entities.UI_DATA_TYPE] = { min: 1, max: 1 };
UIP_RULES[Entities.BOOL_VALUE] = { min: 1, max: 1 };
UIP_RULES[Entities.COMMAND] = { min: 1, max: 1 };
UIP_RULES[Entities.DATE] = { min: 1, max: 1 };
UIP_RULES[Entities.TIME] = { min: 1, max: 1 };
UIP_RULES[Entities.DATE_TIME] = { min: 1, max: 1 };
UIP_RULES[Entities.LONG_TIME] = { min: 1, max: 1 };
UIP_RULES[Entities.LONG_DATE_TIME] = { min: 1, max: 1 };
/**
 * Default syntax rule for UI Properties.
 *
 * @author Thiago Delgado Pinto
 */
export const DEFAULT_UI_PROPERTY_SYNTAX_RULE = UIP_RULES;
/**
 * Syntax rules for the supported UI Properties.
 *
 * Every rule overwrites DEFAULT_UI_PROPERTY_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
export const UI_PROPERTY_SYNTAX_RULES = [
    { name: UIPropertyTypes.ID,
        targets: [
            Entities.VALUE,
            Entities.COMMAND
        ] },
    { name: UIPropertyTypes.TYPE,
        targets: [
            Entities.UI_PROPERTY
        ] },
    { name: UIPropertyTypes.EDITABLE,
        targets: [
            Entities.BOOL_VALUE,
            Entities.NUMBER
        ],
        minTargets: 0 },
    { name: UIPropertyTypes.DATA_TYPE,
        targets: [
            Entities.UI_DATA_TYPE // e.g. string, integer, ...
        ] },
    { name: UIPropertyTypes.VALUE,
        targets: [
            Entities.VALUE,
            Entities.NUMBER,
            Entities.CONSTANT,
            Entities.QUERY,
            Entities.VALUE_LIST,
            Entities.TIME,
            Entities.DATE_TIME,
            Entities.LONG_TIME,
            Entities.LONG_DATE_TIME
        ] },
    { name: UIPropertyTypes.MIN_LENGTH,
        targets: [
            Entities.NUMBER,
            Entities.CONSTANT,
            Entities.QUERY,
        ] },
    { name: UIPropertyTypes.MAX_LENGTH,
        targets: [
            Entities.NUMBER,
            Entities.CONSTANT,
            Entities.QUERY,
        ] },
    { name: UIPropertyTypes.MIN_VALUE,
        targets: [
            Entities.VALUE,
            Entities.NUMBER,
            Entities.CONSTANT,
            Entities.QUERY,
            Entities.DATE,
            Entities.TIME,
            Entities.DATE_TIME,
            Entities.LONG_TIME,
            Entities.LONG_DATE_TIME
        ] },
    { name: UIPropertyTypes.MAX_VALUE,
        targets: [
            Entities.VALUE,
            Entities.NUMBER,
            Entities.CONSTANT,
            Entities.QUERY,
            Entities.DATE,
            Entities.TIME,
            Entities.DATE_TIME,
            Entities.LONG_TIME,
            Entities.LONG_DATE_TIME
        ] },
    { name: UIPropertyTypes.FORMAT,
        targets: [
            Entities.VALUE,
            Entities.CONSTANT
        ] },
    { name: UIPropertyTypes.REQUIRED,
        targets: [
            Entities.BOOL_VALUE,
            Entities.NUMBER
        ],
        minTargets: 0 },
    { name: UIPropertyTypes.LOCALE,
        targets: [
            Entities.VALUE,
            Entities.CONSTANT
        ] },
    { name: UIPropertyTypes.LOCALE_FORMAT,
        targets: [
            Entities.VALUE,
            Entities.CONSTANT
        ] },
];
