"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ast_1 = require("concordialang-types/ast");
const DatabaseTypes_1 = require("./DatabaseTypes");
/**
 * Convert a Database to an AbstractDatabase
 */
class DatabaseToAbstractDatabase {
    /**
     * Returns a database connection from the given database node.
     *
     * @param db Database node.
     * @param basePath Base path, in case of the database is file-based.
     */
    convertFromNode(db, basePath) {
        let dbItems = {};
        if (db.items) {
            for (let item of db.items) {
                dbItems[item.property] = item.value;
            }
        }
        // Tries to use the database name as the path if the path was not given
        if (!dbItems[ast_1.DatabaseProperties.PATH]) {
            dbItems[ast_1.DatabaseProperties.PATH] = db.name;
        }
        const driverType = DatabaseTypes_1.stringToDatabaseTypeString(dbItems[ast_1.DatabaseProperties.TYPE]);
        if (DatabaseTypes_1.isPathBasedDatabaseType(driverType)) {
            dbItems[ast_1.DatabaseProperties.PATH] =
                path_1.resolve(basePath ? basePath : process.cwd(), dbItems[ast_1.DatabaseProperties.PATH]);
        }
        return this.makeAbstractDatabase(driverType, dbItems);
    }
    /**
     * Returns a database connection from the given parameters.
     *
     * @param driverType Database driver type
     * @param dbItems Concordia's database configuration items.
     */
    makeAbstractDatabase(driverType, dbItems) {
        const adb = {
            driverName: driverType,
            username: dbItems[ast_1.DatabaseProperties.USERNAME],
            password: dbItems[ast_1.DatabaseProperties.PASSWORD],
            hostname: dbItems[ast_1.DatabaseProperties.HOST],
            port: dbItems[ast_1.DatabaseProperties.PORT],
            database: dbItems[ast_1.DatabaseProperties.PATH],
            parameters: dbItems[ast_1.DatabaseProperties.OPTIONS]
        };
        return adb;
    }
}
exports.DatabaseToAbstractDatabase = DatabaseToAbstractDatabase;
