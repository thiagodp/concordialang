import dbjs from 'database-js';

import { Database, Table } from '../ast';
import { DatabaseInterface } from '../dbi/DatabaseInterface';
import { DatabaseToAbstractDatabase } from './DatabaseToAbstractDatabase';
import { isPathBasedDatabaseType } from './DatabaseTypes';

/**
 * Handles databases using DatabaseJS.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseJSDatabaseInterface implements DatabaseInterface {

    private _dbConnection: dbjs.Connection = null;

    private _db: Database = null;
    private _basePath: string;

    //
    // FROM DatabaseInterface
    //

    /** @inheritDoc */
    public hasFileBasedDriver = ( databaseType: string ): boolean => {
        return isPathBasedDatabaseType( databaseType );
    };

    /** @inheritDoc */
    public async isConnected(): Promise< boolean > {
        return !! this._dbConnection;
    }

    /** @inheritDoc */
    public async connect( db: Database, basePath?: string ): Promise< boolean > {
        this._db = db;
        this._basePath = basePath;
        this._dbConnection = this.createConnectionFromNode( db, basePath ); // may throw an Error
        return true;
    }

    /** @inheritDoc */
    public async disconnect(): Promise< boolean > {
        if ( ! this._dbConnection ) {
            throw this.dbiError();
        }
        if ( !! this._dbConnection.close ) {
            return await this._dbConnection.close();
        }
        return true;
    }

    /** @inheritDoc */
    public async reconnect(): Promise< boolean > {
        if ( ! this._dbConnection ) {
            throw this.dbiError();
        }
        if ( await this.isConnected() ) {
            await this.disconnect();
        }
        return await this.connect( this._db, this._basePath );
    }


    /** @inheritDoc */
    public async exec( cmd: string, params?: any[] ): Promise< void | any[] > {
        if ( ! params ) {
            return this._dbConnection.prepareStatement( cmd ).execute();
        }
        return this._dbConnection.prepareStatement( cmd ).execute( ... params );
    }

    /** @inheritDoc */
    public async createTable( table: Table ): Promise< boolean > {
        throw new Error( 'Table creation not supported for the DatabaseJS interface.' );
    }

    //
    // FROM Queryable
    //

    /** @inheritDoc */
    public async query( cmd: string, params?: any[] ): Promise< any[] > {
        if ( ! params ) {
            return this._dbConnection.prepareStatement( cmd ).query();
        }
        return this._dbConnection.prepareStatement( cmd ).query( ... params );
    }

    //
    // PRIVATE
    //

    /**
     * Returns a database connection from the given database node.
     *
     * @param db Database node.
     * @param basePath Base path, in case of the database is file-based.
     */
    private createConnectionFromNode( db: Database, basePath?: string ): dbjs.Connection {
        let conversor = new DatabaseToAbstractDatabase();
        let absDB = conversor.convertFromNode( db, basePath );
        return new dbjs.Connection( absDB as dbjs.ConnectionStruct );
    }

    /**
     * Return an error about DBI is not instantiated.
     */
    private dbiError() {
        return new Error( 'Internal database interface not instantiated.' );
    }

}
