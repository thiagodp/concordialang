import { Database, DatabaseProperties } from '../../ast/DataSource';
import { DBWrapper } from 'node-dbi';

/**
 * A simple database wrapper.
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabaseWrapper {

    private _dbi: DBWrapper = null; // internal database interface

    /**
     * Checks if the database is connected.
     */
    isConnected = (): Promise< boolean > => {
        return new Promise( ( resolve, reject ) => {
            if ( ! this._dbi ) {
                resolve( false ); // not connected yet
                return;
            }            
            try {
                resolve( this._dbi.isConnected() );
            } catch ( e ) {
                reject( e );
            }
        } );
    };

    /**
     * Connects to the database.
     */    
    connect = ( db: Database ): Promise< boolean > => {

        return new Promise( ( resolve, reject ) => {
            try {
                if ( ! this._dbi ) {
                    this._dbi = this.createFromNode( db ); // may throw an Error
                } else {
                    const msg = 'Already connected to "' + db.name + '". Please disconnect before opening a new connection.';
                    return reject( new Error( msg ) );
                }
                this._dbi.connect( ( err ) => {
                    if ( err ) {
                        return reject( err );
                    } else {
                        return resolve( true );
                    }
                });
            } catch ( e ) {
                return reject( e );
            }
        } );        
    };

    /**
     * Disconnects from the database.
     */     
    disconnect = () => {
        return new Promise( ( resolve, reject ) => {
            if ( ! this._dbi ) {
                return reject( this.dbiError() );
            }
            this._dbi.close( ( err ) => {
                if ( err ) {
                    reject( err );
                } else {
                    resolve( true );
                }
            } );
        } );         
    };

    exec = ( cmd: string, params?: any ): Promise< any > => {
        return new Promise( ( resolve, reject ) => {
            return reject( new Error( 'Not yet implemented' ) );
        } );        
    };

    query = ( cmd: string, params?: any ) => {
        return new Promise( ( resolve, reject ) => {
            if ( ! this._dbi ) {
                return reject( this.dbiError() );
            }
            this._dbi.fetchAll( cmd, params, ( err, result ) => {
                if ( err ) {
                    return reject( err );
                }
                return resolve( result );
            } );
        } );        
    };

    // private

    private createFromNode = ( db: Database ): DBWrapper => {

        let dbItems = {};

        if ( db.items ) {
            for ( let item of db.items ) {
                dbItems[ item.property ] = item.value;
            }
        }

        if ( ! dbItems[ DatabaseProperties.PATH ] ) {
            dbItems[ DatabaseProperties.PATH ] = db.name;
        }

        const dbType = this.databaseTypeToNodeDbiAdapter( dbItems[ DatabaseProperties.TYPE ] );
        const connConfig = {
            // documented in Node-DBI
            host        : dbItems[ DatabaseProperties.HOST ],
            database    : dbItems[ DatabaseProperties.PATH ],
            user        : dbItems[ DatabaseProperties.USERNAME ],
            password    : dbItems[ DatabaseProperties.PASSWORD ],

            // supported???
            port        : dbItems[ DatabaseProperties.PORT ],
            charset     : dbItems[ DatabaseProperties.CHARSET ],
            options     : dbItems[ DatabaseProperties.OPTIONS ]
        };
        
        return new DBWrapper( dbType, connConfig );
    };


    /**
     * Returns an adapter expected by Node-DBI.
     * 
     * @param dbType 
     */
    private databaseTypeToNodeDbiAdapter = ( dbType: string ): string => {
        
        if ( ! dbType ) {
            return 'unknown';
        }

        const dbt = dbType.toLowerCase();
        if ( DBWrapper._availableAdapters.indexOf( dbt ) >= 0 ) {
            return dbt;
        }

        switch( dbType.toLowerCase() ) {
            case 'postgree'     : return 'pg';
            case 'postgreesql'  : return 'pg';
            case 'mysql'        : return 'mysql';
            case 'sqlite'       : return 'sqlite3';
            default             : return 'unknown';
        }
    };

    /**
     * Return an error about DBI is not instantied.
     */
    private dbiError = () => {
        return new Error( 'Internal database interface not instantied.' );
    };

}