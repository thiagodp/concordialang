"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlHelper = void 0;
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
/**
 * SQL helper.
 *
 * @author Thiago Delgado Pinto
 */
class SqlHelper {
    constructor() {
        this._valueTypeDetector = new ValueTypeDetector_1.ValueTypeDetector();
    }
    generateUse(name) {
        return 'USE `' + name + '`;';
    }
    generateCreate(name, columns) {
        return 'CREATE TABLE IF NOT EXISTS `' + name + '` ' + '( `' + columns.join('`, `') + '` );';
    }
    generateCreateWithTypes(name, sqlColumns) {
        return 'CREATE TABLE IF NOT EXISTS `' + name + '` ( ' + sqlColumns.join(', ') + ' );';
    }
    generateDrop(name) {
        return 'DROP TABLE `' + name + '`;';
    }
    generateParameterizedInsert(name, columns) {
        return 'INSERT INTO `' + name + '` VALUES ( ' + columns.map(v => '?').join(', ') + ' );';
    }
    generateInsert(name, values) {
        return 'INSERT INTO `' + name + '` VALUES '
            + this.linesToSqlInsertValues(values)
            + ';';
    }
    lineToSqlInsertValues(line) {
        let content = [];
        for (let val of line) {
            if (this._valueTypeDetector.isBoolean(val)) {
                content.push(val);
            }
            else if (this._valueTypeDetector.isDouble(val)) {
                content.push(parseFloat(val));
            }
            else if (this._valueTypeDetector.isInteger(val)) {
                content.push(parseInt(val));
            }
            else {
                content.push('"' + val + '"');
            }
        }
        return '( ' + content.join(', ') + ' )';
    }
    linesToSqlInsertValues(lines) {
        return lines.map(val => this.lineToSqlInsertValues(val)).join(', ');
    }
    convertToSQLType(t) {
        switch (t) {
            case ValueTypeDetector_1.ValueType.BOOLEAN: return 'BOOLEAN';
            case ValueTypeDetector_1.ValueType.DOUBLE: return 'DOUBLE';
            case ValueTypeDetector_1.ValueType.INTEGER: return 'INT';
            case ValueTypeDetector_1.ValueType.DATE: return 'DATE';
            case ValueTypeDetector_1.ValueType.LONG_TIME: // see next
            case ValueTypeDetector_1.ValueType.TIME: return 'TIME';
            case ValueTypeDetector_1.ValueType.LONG_DATE_TIME: // see next
            case ValueTypeDetector_1.ValueType.DATE_TIME: return 'DATETIME';
            default: return 'STRING';
        }
    }
    generateSqlColumns(columns, sqlTypes) {
        const typesLen = sqlTypes.length;
        let i = 0, sqlColumns = [];
        for (let col of columns) {
            if (i < typesLen) {
                sqlColumns.push('`' + col + '` ' + sqlTypes[i]);
            }
            else {
                sqlColumns.push('`' + col + '` STRING');
            }
            ++i;
        }
        return sqlColumns;
    }
}
exports.SqlHelper = SqlHelper;
