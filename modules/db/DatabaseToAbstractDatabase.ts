import { resolve } from 'path';
import { Database, DatabaseProperties, AbstractDatabase } from "concordialang-types/ast";
import { stringToDatabaseTypeString, isPathBasedDatabaseType } from "./DatabaseTypes";

/**
 * Convert a Database to an AbstractDatabase
 */
export class DatabaseToAbstractDatabase {

    /**
     * Returns a database connection from the given database node.
     *
     * @param db Database node.
     * @param basePath Base path, in case of the database is file-based.
     */
    convertFromNode( db: Database, basePath?: string ): AbstractDatabase {

        let dbItems = {};

        if ( db.items ) {
            for ( let item of db.items ) {
                dbItems[ item.property ] = item.value;
            }
        }

        // Tries to use the database name as the path if the path was not given
        if ( ! dbItems[ DatabaseProperties.PATH ] ) {
            dbItems[ DatabaseProperties.PATH ] = db.name;
        }

        const driverType = stringToDatabaseTypeString( dbItems[ DatabaseProperties.TYPE ] );

        if ( isPathBasedDatabaseType( driverType ) ) {
            dbItems[ DatabaseProperties.PATH ] =
                resolve(
                    basePath ? basePath : process.cwd(),
                    dbItems[ DatabaseProperties.PATH ]
                );
        }

        return this.makeAbstractDatabase( driverType, dbItems );
    }


    /**
     * Returns a database connection from the given parameters.
     *
     * @param driverType Database driver type
     * @param dbItems Concordia's database configuration items.
     */
    private makeAbstractDatabase( driverType: string, dbItems: object ): AbstractDatabase {

        const adb: AbstractDatabase = {
            driverName: driverType,
            username: dbItems[ DatabaseProperties.USERNAME ],
            password: dbItems[ DatabaseProperties.PASSWORD ],
            hostname: dbItems[ DatabaseProperties.HOST ],
            port: dbItems[ DatabaseProperties.PORT ],
            database: dbItems[ DatabaseProperties.PATH ],
            parameters: dbItems[ DatabaseProperties.OPTIONS ]
        };

        return adb;
    }

}