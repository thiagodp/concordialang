"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("../../ast");
const Entities_1 = require("../Entities");
const DB_RULES = {
    minTargets: 1,
    maxTargets: 1,
    targets: [Entities_1.Entities.VALUE],
};
DB_RULES[Entities_1.Entities.VALUE] = { min: 1, max: 1 };
DB_RULES[Entities_1.Entities.NUMBER] = { min: 1, max: 1 };
/**
 * Default syntax rule for Database Properties.
 *
 * @author Thiago Delgado Pinto
 */
exports.DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE = DB_RULES;
/**
 * Syntax rules for the supported Database Properties. Every rule overwrites DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE.
 *
 * @author Thiago Delgado Pinto
 */
exports.DATABASE_PROPERTY_SYNTAX_RULES = [
    { name: ast_1.DatabaseProperties.TYPE, targets: [Entities_1.Entities.VALUE] },
    { name: ast_1.DatabaseProperties.PATH, targets: [Entities_1.Entities.VALUE] },
    { name: ast_1.DatabasePropertyAlias.NAME, targets: [Entities_1.Entities.VALUE] },
    { name: ast_1.DatabaseProperties.HOST, targets: [Entities_1.Entities.VALUE] },
    { name: ast_1.DatabaseProperties.PORT, targets: [Entities_1.Entities.VALUE, Entities_1.Entities.NUMBER] },
    { name: ast_1.DatabaseProperties.USERNAME, targets: [Entities_1.Entities.VALUE] },
    { name: ast_1.DatabaseProperties.PASSWORD, targets: [Entities_1.Entities.VALUE] },
    { name: ast_1.DatabaseProperties.CHARSET, targets: [Entities_1.Entities.VALUE] },
    { name: ast_1.DatabaseProperties.OPTIONS, targets: [Entities_1.Entities.VALUE] }
];
