import { ExternalReferenceException } from '../../req/ExternalReferenceException';
import { DatabaseWrapper } from './DatabaseWrapper';
import { LocatedException } from '../../req/LocatedException';
import { Spec } from '../../ast/Spec';

/**
 * Checks all the connections of a specification.
 * 
 * @author Thiago Delgado Pinto
 */
export class ConnectionChecker {

    constructor( private _writer: any ) {
    }

    async check(
        spec: Spec,
        errors: LocatedException[],
        warnings: LocatedException[]
    ): Promise< ConnectionCheckResult > {

        let r: ConnectionCheckResult = {
            success: true,
            results: {}
        } as ConnectionCheckResult;

        for ( let doc of spec.docs ) {
            for ( let db of doc.databases ) {
                let wrapper: DatabaseWrapper = new DatabaseWrapper();

                let cr: ConnectionResult = {
                    success: true,
                    databaseName: db.name,
                    wrapper: wrapper
                } as ConnectionResult;

                r.results[ db.name ] = cr;                

                // connect
                try {
                    await wrapper.connect( db );
                } catch ( err ) {
                    r.success = false;
                    cr.success = false;
                    const msg = 'Cannot connect to database "' + db.name + '".';
                    errors.push( new ExternalReferenceException( msg, db.location ) );
                    continue;
                }
                // disconnect
                try {
                    if ( await wrapper.isConnected() ) {
                        await wrapper.disconnect();
                    }
                } catch ( err ) {
                    const msg = 'Error while disconnecting from database "' +
                        db.name + '". Details: ' + err.message;
                    warnings.push( new ExternalReferenceException( msg, db.location ) );
                }
            }
        }
        return r;
    }

}


export interface ConnectionResult {
    databaseName: string;
    success: boolean;
    wrapper: DatabaseWrapper;
}

export interface ConnectionCheckResult {
    success: boolean;
    results: object; // name => ConnectionResult
}
