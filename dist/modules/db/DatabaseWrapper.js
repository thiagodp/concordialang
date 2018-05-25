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
const Database_1 = require("../ast/Database");
// import { DBWrapper } from 'node-dbi';
//import * as dbjs from 'database-js2';
//import { Connection, ConnectionObject } from 'database-js2';
const dbjs = require("database-js");
//var Connection = dbjs.Connection;
//var ConnectionObject = dbjs.ConnectionObject;
const path = require("path");
const DatabaseTypes_1 = require("./DatabaseTypes");
/**
 * A simple database wrapper.
 *
 * @author Thiago Delgado Pinto
 */
class DatabaseWrapper {
    constructor() {
        this._dbi = null; // internal database interface
        this._db = null;
        /** @inheritDoc */
        this.hasFileBasedDriver = (databaseType) => {
            // const driverType = this.databaseTypeToDriverType( databaseType );
            // return [ 'json', 'csv', 'xls', 'xml', 'ini', 'yml', 'dbase', 'firebird', 'interbase' ]
            //     .indexOf( driverType ) >= 0;
            return DatabaseTypes_1.isPathBasedDatabaseType(databaseType);
        };
    }
    /** @inheritDoc */
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!this._dbi;
        });
    }
    /** @inheritDoc */
    connect(db, basePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._db = db;
            this._dbi = this.createConnectionFromNode(db, basePath); // may throw an Error
            return true;
        });
    }
    /** @inheritDoc */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._dbi) {
                throw this.dbiError();
            }
            if (!!this._dbi.close) {
                return yield this._dbi.close();
            }
            return true;
        });
    }
    /** @inheritDoc */
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._dbi) {
                throw this.dbiError();
            }
            if (yield this.isConnected()) {
                yield this.disconnect();
            }
            return yield this.connect(this._db);
        });
    }
    /** @inheritDoc */
    exec(cmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params) {
                return this._dbi.prepareStatement(cmd).execute();
            }
            return this._dbi.prepareStatement(cmd).execute(...params);
        });
    }
    /** @inheritDoc */
    query(cmd, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params) {
                return this._dbi.prepareStatement(cmd).query();
            }
            return this._dbi.prepareStatement(cmd).query(...params);
        });
    }
    //
    // private
    //
    /**
     * Returns a database connection from the given database node.
     *
     * @param db Database node.
     * @param basePath Base path, in case of the database is file-based.
     */
    createConnectionFromNode(db, basePath) {
        let dbItems = {};
        if (db.items) {
            for (let item of db.items) {
                dbItems[item.property] = item.value;
            }
        }
        // Tries to use the database name as the path if the path was not given
        if (!dbItems[Database_1.DatabaseProperties.PATH]) {
            dbItems[Database_1.DatabaseProperties.PATH] = db.name;
        }
        const driverType = DatabaseTypes_1.stringToDatabaseTypeString(dbItems[Database_1.DatabaseProperties.TYPE]);
        if (this.hasFileBasedDriver(driverType)) {
            dbItems[Database_1.DatabaseProperties.PATH] =
                path.resolve(basePath ? basePath : process.cwd(), dbItems[Database_1.DatabaseProperties.PATH]);
        }
        return this.makeConnection(driverType, dbItems);
    }
    /**
     * Returns a database connection from the given parameters.
     *
     * @param driverType Database driver type
     * @param dbItems Concordia's database configuration items.
     */
    makeConnection(driverType, dbItems) {
        /*
        const driver = undefined; // not needed

        const connObj = new dbjs.ConnectionObject(
            driverType,
            dbItems[ DatabaseProperties.USERNAME ],
            dbItems[ DatabaseProperties.PASSWORD ],
            dbItems[ DatabaseProperties.HOST ],
            dbItems[ DatabaseProperties.PORT ],
            dbItems[ DatabaseProperties.PATH ],
            dbItems[ DatabaseProperties.OPTIONS ],
            driver
        );
        */
        const connObj = {
            driverName: driverType,
            username: dbItems[Database_1.DatabaseProperties.USERNAME],
            password: dbItems[Database_1.DatabaseProperties.PASSWORD],
            hostname: dbItems[Database_1.DatabaseProperties.HOST],
            port: dbItems[Database_1.DatabaseProperties.PORT],
            database: dbItems[Database_1.DatabaseProperties.PATH],
            parameters: dbItems[Database_1.DatabaseProperties.OPTIONS]
        };
        return new dbjs.Connection(connObj);
    }
    /**
     * Return an error about DBI is not instantied.
     */
    dbiError() {
        return new Error('Internal database interface not instantied.');
    }
}
exports.DatabaseWrapper = DatabaseWrapper;
// export class DatabaseWrapper implements DatabaseInterface {
//     private _dbi: DBWrapper = null; // internal database interface
//     /** @inheritDoc */
//     isConnected = (): Promise< boolean > => {
//         return new Promise( ( resolve, reject ) => {
//             if ( ! this._dbi ) {
//                 resolve( false ); // not connected yet
//                 return;
//             }
//             try {
//                 resolve( this._dbi.isConnected() );
//             } catch ( e ) {
//                 reject( e );
//             }
//         } );
//     };
//     /** @inheritDoc */
//     connect = ( db: Database ): Promise< boolean > => {
//         return new Promise( ( resolve, reject ) => {
//             try {
//                 if ( ! this._dbi ) {
//                     this._dbi = this.createConnectionFromNode( db ); // may throw an Error
//                 } else {
//                     const msg = 'Already connected to "' + db.name + '". Please disconnect before opening a new connection.';
//                     return reject( new Error( msg ) );
//                 }
//                 this._dbi.connect( ( err ) => {
//                     if ( err ) {
//                         return reject( err );
//                     } else {
//                         return resolve( true );
//                     }
//                 });
//             } catch ( e ) {
//                 return reject( e );
//             }
//         } );
//     };
//     /** @inheritDoc */
//     disconnect = (): Promise< boolean > => {
//         return new Promise( ( resolve, reject ) => {
//             if ( ! this._dbi ) {
//                 return reject( this.dbiError() );
//             }
//             this._dbi.close( ( err ) => {
//                 if ( err ) {
//                     reject( err );
//                 } else {
//                     resolve( true );
//                 }
//             } );
//         } );
//     };
//     /** @inheritDoc */
//     reconnect = (): Promise< boolean > => {
//         return new Promise( ( resolve, reject ) => {
//             if ( ! this._dbi ) {
//                 return reject( this.dbiError() );
//             }
//             this._dbi.connect( ( err ) => {
//                 if ( err ) {
//                     reject( err );
//                 } else {
//                     resolve( true );
//                 }
//             } );
//         } );
//     };
//     /** @inheritDoc */
//     exec = ( cmd: string, params?: any ): Promise< any[] > => {
//         return new Promise( ( resolve, reject ) => {
//             return reject( new Error( 'Not yet implemented' ) );
//         } );
//     };
//     /** @inheritDoc */
//     query = ( cmd: string, params?: any ): Promise< any[] > => {
//         return new Promise( ( resolve, reject ) => {
//             if ( ! this._dbi ) {
//                 return reject( this.dbiError() );
//             }
//             this._dbi.fetchAll( cmd, params, ( err, result ) => {
//                 if ( err ) {
//                     return reject( err );
//                 }
//                 return resolve( result );
//             } );
//         } );
//     };
//     // private
//     private createConnectionFromNode = ( db: Database ): DBWrapper => {
//         let dbItems = {};
//         if ( db.items ) {
//             for ( let item of db.items ) {
//                 dbItems[ item.property ] = item.value;
//             }
//         }
//         // Tries to use the database name as the path if the path was not given
//         if ( ! dbItems[ DatabaseProperties.PATH ] ) {
//             dbItems[ DatabaseProperties.PATH ] = db.name;
//         }
//         const driverType = this.databaseTypeToDriverType( dbItems[ DatabaseProperties.TYPE ] );
//         return this.makeConnection( driverType, dbItems );
//     };
//     private makeConnection = ( driverType: string, dbItems: object ): DBWrapper => {
//         const connConfig = {
//             // documented in Node-DBI
//             host        : dbItems[ DatabaseProperties.HOST ],
//             database    : dbItems[ DatabaseProperties.PATH ],
//             user        : dbItems[ DatabaseProperties.USERNAME ],
//             password    : dbItems[ DatabaseProperties.PASSWORD ],
//             // supported???
//             port        : dbItems[ DatabaseProperties.PORT ],
//             charset     : dbItems[ DatabaseProperties.CHARSET ],
//             options     : dbItems[ DatabaseProperties.OPTIONS ]
//         };
//         return new DBWrapper( driverType, connConfig );
//     };
//     /**
//      * Returns a driver type according to the given database type.
//      *
//      * @param dbType
//      */
//     private databaseTypeToDriverType = ( dbType: string ): string => {
//         if ( ! dbType ) {
//             return 'unknown';
//         }
//         const dbt = dbType.toLowerCase();
//         if ( DBWrapper._availableAdapters.indexOf( dbt ) >= 0 ) {
//             return dbt;
//         }
//         switch( dbType.toLowerCase() ) {
//             case 'postgree'     : return 'pg';
//             case 'postgreesql'  : return 'pg';
//             case 'mysql'        : return 'mysql';
//             case 'sqlite'       : return 'sqlite3';
//             default             : return 'unknown';
//         }
//     };
//     /**
//      * Return an error about DBI is not instantied.
//      */
//     private dbiError = () => {
//         return new Error( 'Internal database interface not instantied.' );
//     };
// }
