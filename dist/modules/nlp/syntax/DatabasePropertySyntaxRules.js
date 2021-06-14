import { DatabaseProperties, DatabasePropertyAlias } from "../../ast";
import { Entities } from "../Entities";
const DB_RULES = {
    minTargets: 1,
    maxTargets: 1,
    targets: [Entities.VALUE],
};
DB_RULES[Entities.VALUE] = { min: 1, max: 1 };
DB_RULES[Entities.NUMBER] = { min: 1, max: 1 };
/**
 * Default syntax rule for Database Properties.
 *
 * @author Thiago Delgado Pinto
 */
export const DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE = DB_RULES;
/**
 * Syntax rules for the supported Database Properties. Every rule overwrites DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
export const DATABASE_PROPERTY_SYNTAX_RULES = [
    { name: DatabaseProperties.TYPE, targets: [Entities.VALUE] },
    { name: DatabaseProperties.PATH, targets: [Entities.VALUE] },
    { name: DatabasePropertyAlias.NAME, targets: [Entities.VALUE] },
    { name: DatabaseProperties.HOST, targets: [Entities.VALUE] },
    { name: DatabaseProperties.PORT, targets: [Entities.VALUE, Entities.NUMBER] },
    { name: DatabaseProperties.USERNAME, targets: [Entities.VALUE] },
    { name: DatabaseProperties.PASSWORD, targets: [Entities.VALUE] },
    { name: DatabaseProperties.CHARSET, targets: [Entities.VALUE] },
    { name: DatabaseProperties.OPTIONS, targets: [Entities.VALUE] }
];
