import { DatabaseInterface } from './DatabaseInterface';
import { LocatedException } from './LocatedException';
import { InMemoryTableInterface } from './InMemoryTableInterface';


export enum ConnectionType {
    IN_MEMORY_TABLE,
    DATABASE
}

export class ConnectionResult_ {

    private constructor(
        public type: ConnectionType,
        public intf: DatabaseInterface | InMemoryTableInterface,
        public error: LocatedException | null
    ) {
    }

    static forTable(
        intf: InMemoryTableInterface,
        error: LocatedException = null
    ): ConnectionResult_ {
        return new ConnectionResult_(
            ConnectionType.IN_MEMORY_TABLE,
            intf,
            error
        );
    }

    static forDatabase(
        intf: DatabaseInterface,
        error: LocatedException = null
    ): ConnectionResult_ {
        return new ConnectionResult_(
            ConnectionType.DATABASE,
            intf,
            error
        );
    }
}

export class ConnectionContext {

    // Maps a database name or a table name to its connection result
    public map = new Map< string, ConnectionResult_ >();
}

// ---

/**
 * Connection result.
 *
 * @author Thiago Delgado Pinto
 */
export interface ConnectionResult {
    databaseName: string;
    success: boolean;
    errors: LocatedException[];
    dbi: DatabaseInterface;
}

/**
 * Connection check result.
 *
 * @author Thiago Delgado Pinto
 */
export class ConnectionCheckResult {

    constructor(
        public success: boolean = false,
        public resultsMap: object = {} // name => ConnectionResult
    ) {
    }

    /*
    add = ( name: string, r: ConnectionResult ): void => {
        this.resultsMap[ name ] = r;
    };

    withName = ( name: string ): ConnectionResult | undefined => {
        return this.resultsMap[ name ];
    };
    */

    succeededResults(): ConnectionResult[] {
        let results: ConnectionResult[] = [];
        for ( let name in this.resultsMap ) {
            let r: ConnectionResult = this.resultsMap[ name ];
            if ( r.success ) {
                results.push( r );
            }
        }
        return results;
    }

}

// ---