import * as alasql from 'alasql';
import { Database, Table } from '../ast';
import { DatabaseInterface } from "../dbi/DatabaseInterface";
import { AlaSqlTableCreator } from './AlaSqlTableCreator';
import { AlaSqlDatabase } from './AlaSqlTypes';
import { SqlHelper } from './SqlHelper';


/**
 * Handles in-memory databases using AlaSql.
 *
 * @author Thiago Delgado Pinto
 */
export class AlaSqlDatabaseInterface implements DatabaseInterface {

    public readonly dbConnection: AlaSqlDatabase;

    private _db: Database;
    private _basePath: string;

    private readonly _sqlHelper: SqlHelper = new SqlHelper();

    //
    // FROM DatabaseInterface
    //

    /** @inheritDoc */
    hasFileBasedDriver( databaseType: string ): boolean {
        const dbType = databaseType.toLowerCase();
        return 'memory' === dbType || 'alasql' === dbType;
    }

    /** @inheritDoc */
    async isConnected(): Promise< boolean > {
        return true; // currently always true
    }

    /** @inheritDoc */
    async connect( db: Database, basePath?: string ): Promise< boolean > {
        this._db = db;
        this._basePath = basePath;

        // @ts-ignore
        this.dbConnection = new alasql.Database( db.name ); // Cannot be new AlaSqlDatabase !
        alasql( this._sqlHelper.generateUse( db.name ) );

        return true;
    }

    /** @inheritDoc */
    async disconnect(): Promise< boolean > {
        // Currently does nothing
        return true;
    }

    /** @inheritDoc */
    async reconnect(): Promise< boolean > {
        if ( await this.isConnected() ) {
            await this.disconnect();
        }
        if ( ! this._db ) {
            return false;
        }
        return await this.connect( this._db, this._basePath );
    }

    /** @inheritDoc */
    async exec( cmd: string, params?: any ): Promise< any[] > {

        // console.log( 'CMD', cmd, 'PARAMETERS', params );

        return new Promise< any[] >( ( resolve, reject ) => {

            if ( ! this.dbConnection ) {
                let e = new Error( 'Database is not connected.' );
                return reject( e );
            }

            try {
                this.dbConnection.exec(
                    cmd,
                    params,
                    ( data ) => resolve( data )
                );
                // // @ts-ignore
                // let select = alasql.compile( cmd );
                // let data = select( params );
                // resolve( data );
            } catch ( e ) {
                // console.log( 'CMD ERROR', e.message );
                reject( e );
            }

        } );
    }

    /** @inheritDoc */
    async createTable( table: Table ): Promise< boolean > {
        if ( ! this.dbConnection ) {
            throw new Error( 'Database is not connected.' );
        }
        const creator = new AlaSqlTableCreator();
        return await creator.createTableFromNode( this.dbConnection, table );
    }

    //
    // FROM Queryable
    //

    /** @inheritDoc */
    async query( cmd: string, params?: any ): Promise< any[] > {
        return await this.exec( cmd, params );
    }

}