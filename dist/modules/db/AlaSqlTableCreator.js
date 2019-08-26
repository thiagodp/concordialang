"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const alasql = require("alasql");
const error_1 = require("../error");
const util_1 = require("../util");
const SqlHelper_1 = require("./SqlHelper");
/**
 * Creates database tables from Table nodes.
 *
 * @author Thiago Delgado Pinto
 */
class AlaSqlTableCreator {
    constructor() {
        this._sqlHelper = new SqlHelper_1.SqlHelper();
        this._valueTypeDetector = new util_1.ValueTypeDetector();
    }
    /**
     * Creates a table from a database connection and a table node.
     *
     * @param dbConnection Database connection
     * @param table Table node
     */
    createTableFromNode(dbConnection, table) {
        return __awaiter(this, void 0, void 0, function* () {
            const rowCount = table.rows.length;
            if (rowCount < 2) {
                const msg = `Table "${table.name}" must have at least two rows: the first one with column names and second one with values.`;
                throw new error_1.RuntimeException(msg, table.location);
            }
            // Detect value types in the first data row, to create the table
            const columnRow = table.rows[0];
            // const firstDataRow = table.rows[ 1 ];
            // const valTypes: ValueType[] = this._valueTypeDetector.detectAll( firstDataRow.cells );
            const valTypes = this.detectTableColumnTypes(table);
            const sqlTypes = valTypes.map(v => this._sqlHelper.convertToSQLType(v));
            const sqlColumns = this._sqlHelper.generateSqlColumns(columnRow.cells, sqlTypes);
            const createCommand = this._sqlHelper.generateCreateWithTypes(table.internalName, sqlColumns);
            try {
                // console.log( 'TABLE CREATION COMMAND: ', createCommand );
                dbConnection.exec(createCommand); // Creates the table if it does not exist
            }
            catch (e) {
                const msg = `Error creating the table "${table.name}": ${e.message}`;
                throw new error_1.RuntimeException(msg, table.location);
            }
            // Prepares a parameterized insert
            const insertCommand = this._sqlHelper.generateParameterizedInsert(table.internalName, columnRow.cells);
            // @ts-ignore
            let insert = alasql.compile(insertCommand);
            if (!util_1.isDefined(insert)) {
                const msg = `Error compiling the insert command at the table "${table.name}".`;
                throw new error_1.RuntimeException(msg, table.location);
            }
            // Inserts the values
            for (let i = 1; i < rowCount; ++i) { // starts at the second row
                const row = table.rows[i];
                try {
                    // console.log( 'row', row );
                    let params = this.normalizeValues(row.cells, valTypes);
                    // console.log( 'params', params );
                    insert(params);
                }
                catch (e) {
                    const msg = `Error inserting values in the table "${table.name}": ${e.message}`;
                    throw new error_1.RuntimeException(msg, table.location);
                }
            }
            // console.log( createCommand, "\n", insertCommand );
            return true;
        });
    }
    detectTableColumnTypes(table) {
        let valTypes = [];
        const rowCount = table.rows.length;
        for (let i = 1; i < rowCount; ++i) {
            let row = table.rows[i];
            let currentTypes = this._valueTypeDetector.detectAll(row.cells);
            if (valTypes.length < 1) {
                valTypes = currentTypes;
                continue;
            }
            // Compare
            for (let j = 0; j < currentTypes.length; ++j) {
                if (currentTypes[j] === valTypes[j]) {
                    continue;
                }
                // Different -> string prevails
                if (currentTypes[j] === util_1.ValueType.STRING) {
                    valTypes[j] = currentTypes[j];
                }
            }
        }
        return valTypes;
    }
    normalizeValues(values, types) {
        const typesLen = types.length;
        let i = 0, normalized = [];
        for (let val of values) {
            if (i < typesLen) {
                normalized.push(this.normalizeValue(val, types[i]));
            }
            else {
                normalized.push(val);
            }
            ++i;
        }
        return normalized;
    }
    normalizeValue(value, type) {
        let detectedType = this._valueTypeDetector.detect(value);
        // switch ( type ) {
        switch (detectedType) {
            case util_1.ValueType.BOOLEAN: return this._valueTypeDetector.isTrue(value);
            case util_1.ValueType.INTEGER: return parseInt(value);
            case util_1.ValueType.DOUBLE: return parseFloat(value);
            default: return value;
        }
    }
}
exports.AlaSqlTableCreator = AlaSqlTableCreator;
