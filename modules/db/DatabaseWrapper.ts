import dbjs = require( 'database-js' );
import { DatabaseInterface } from 'concordialang-types/req';
import { Database } from 'concordialang-types/ast';
import { isPathBasedDatabaseType } from './DatabaseTypes';
import { DatabaseToAbstractDatabase } from './DatabaseToAbstractDatabase';

/**
 * A simple database wrapper.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseWrapper implements DatabaseInterface {

    private _dbi: dbjs.Connection = null; // internal database interface
    private _db: Database = null;

    /** @inheritDoc */
    public hasFileBasedDriver = ( databaseType: string ): boolean => {
        return isPathBasedDatabaseType( databaseType );
    };

    /** @inheritDoc */
    public async isConnected(): Promise< boolean > {
        return !! this._dbi;
    }


    /** @inheritDoc */
    public async connect( db: Database, basePath?: string ): Promise< boolean > {
        this._db = db;
        this._dbi = this.createConnectionFromNode( db, basePath ); // may throw an Error
        return true;
    }


    /** @inheritDoc */
    public async disconnect(): Promise< boolean > {
        if ( ! this._dbi ) {
            throw this.dbiError();
        }
        if ( !! this._dbi.close ) {
            return await this._dbi.close();
        }
        return true;
    }


    /** @inheritDoc */
    public async reconnect(): Promise< boolean > {
        if ( ! this._dbi ) {
            throw this.dbiError();
        }
        if ( await this.isConnected() ) {
            await this.disconnect();
        }
        return await this.connect( this._db );
    }


    /** @inheritDoc */
    public async exec( cmd: string, params?: any[] ): Promise< any[] > {
        if ( ! params ) {
            return this._dbi.prepareStatement( cmd ).execute();
        }
        return this._dbi.prepareStatement( cmd ).execute( ... params );
    }

    /** @inheritDoc */
    public async query( cmd: string, params?: any[] ): Promise< any[] > {
        if ( ! params ) {
            return this._dbi.prepareStatement( cmd ).query();
        }
        return this._dbi.prepareStatement( cmd ).query( ... params );
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
    private createConnectionFromNode( db: Database, basePath?: string ): dbjs.Connection {
        let conversor = new DatabaseToAbstractDatabase();
        let absDB = conversor.convertFromNode( db, basePath );
        return new dbjs.Connection( absDB );
    }

    /**
     * Return an error about DBI is not instantied.
     */
    private dbiError() {
        return new Error( 'Internal database interface not instantied.' );
    }

}
