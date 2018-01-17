import { InMemoryTableInterface } from "./InMemoryTableInterface";
import * as alasql from 'alasql';

/**
 * In-memory table wrapper
 * 
 * @author Thiago Delgado Pinto
 */
export class InMemoryTableWrapper implements InMemoryTableInterface {

    constructor( private _db: alasql.Database ) {
    }

    /** @inheritDoc */
    query = async( cmd: string, params?: any): Promise< any[] > => {
        return new Promise< any[] >( ( resolve, reject ) => {
            try {
                this._db.exec( cmd, params, ( data ) => resolve( data ) );
            } catch ( e ) {
                reject( e );
            }
        } );
    };
    
}