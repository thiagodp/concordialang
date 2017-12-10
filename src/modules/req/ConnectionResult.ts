import { DatabaseInterface } from './DatabaseInterface';

/**
 * Connection result.
 * 
 * @author Thiago Delgado Pinto
 */
export interface ConnectionResult {
    databaseName: string;
    success: boolean;
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

    succeededResults = (): ConnectionResult[] => {
        let results: ConnectionResult[] = [];
        for ( let name in this.resultsMap ) {
            let r: ConnectionResult = this.resultsMap[ name ];
            if ( r.success ) {
                results.push( r );
            }
        }
        return results;
    };

}