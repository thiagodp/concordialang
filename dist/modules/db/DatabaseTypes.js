import { isValue } from "enum-util";
/**
 * Currently supported database types, through `database-js`.
 *
 * @see https://github.com/mlaanderson/database-js
 */
export var DatabaseType;
(function (DatabaseType) {
    DatabaseType["MYSQL"] = "mysql";
    DatabaseType["POSTGRESQL"] = "postgres";
    DatabaseType["SQLITE"] = "sqlite";
    DatabaseType["ADO"] = "adodb";
    DatabaseType["FIREBASE"] = "firebase";
    DatabaseType["INI"] = "ini";
    DatabaseType["EXCEL"] = "xlsx";
    DatabaseType["CSV"] = "csv";
    DatabaseType["JSON"] = "json";
    DatabaseType["MSSQL"] = "mssql";
})(DatabaseType || (DatabaseType = {}));
export function isPathBasedDatabaseType(dbType) {
    return [
        DatabaseType.SQLITE.toString(),
        DatabaseType.ADO.toString(),
        DatabaseType.INI.toString(),
        DatabaseType.EXCEL.toString(),
        DatabaseType.CSV.toString(),
        DatabaseType.JSON.toString()
    ].indexOf(stringToDatabaseTypeString(dbType)) >= 0;
}
export function stringToDatabaseTypeString(dbType) {
    if (!dbType) {
        return 'unknown';
    }
    const lowerCasedType = dbType.toLowerCase();
    // Check DatabaseType
    if (isValue(DatabaseType, lowerCasedType)) {
        return lowerCasedType;
    }
    // Check similar values
    switch (lowerCasedType) {
        case 'postgresql': return DatabaseType.POSTGRESQL;
        case 'ado': return DatabaseType.ADO;
        case 'xls': return DatabaseType.EXCEL;
        case 'sqlserver': // next
        case 'mssqlserver': return DatabaseType.MSSQL;
        default: return 'unknown';
    }
}
/**
 * Returns true whether the database supports table or collections in queries.
 *
 * @param dbType Database type
 */
export function supportTablesInQueries(dbType) {
    // The following DOES NOT SUPPORT the concept of tables or collections
    return [
        DatabaseType.CSV.toString(),
        DatabaseType.JSON.toString()
    ].indexOf(stringToDatabaseTypeString(dbType)) < 0;
}
