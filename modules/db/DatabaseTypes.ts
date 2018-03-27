import { toEnumValue } from "../util/ToEnumValue";
import { isDefined } from "../util/TypeChecking";

/**
 * Currently supported database types, through `database-js`.
 *
 * @see https://github.com/mlaanderson/database-js
 */
export enum DatabaseType {
    MYSQL = 'mysql',
    POSTGRESQL = 'postgres',
    SQLITE = 'sqlite',
    ADO = 'adodb',
    FIREBASE = 'firebase',
    INI = 'ini',
    EXCEL = 'xlsx',
    CSV = 'csv',
    JSON = 'json'
}

export function isPathBasedDatabaseType( dbType: string ): boolean {
    return [
        DatabaseType.SQLITE.toString(),
        DatabaseType.ADO.toString(),
        DatabaseType.INI.toString(),
        DatabaseType.EXCEL.toString(),
        DatabaseType.CSV.toString(),
        DatabaseType.JSON.toString()
    ].indexOf( stringToDatabaseTypeString( dbType ) ) >= 0;
}


export function stringToDatabaseTypeString( dbType: string ): string {
    if ( ! dbType ) {
        return 'unknown';
    }
    const lowerCasedType = dbType.toLowerCase();

    // Check DatabaseType
    const val = toEnumValue( lowerCasedType, DatabaseType );
    if ( isDefined( val ) ) {
        return val;
    }

    // Check similar values
    switch ( lowerCasedType ) {
        case 'postgresql'   : return DatabaseType.POSTGRESQL
        case 'ado'          : return DatabaseType.ADO;
        case 'xls'          : return DatabaseType.EXCEL;
        default             : return 'unknown';
    }
}