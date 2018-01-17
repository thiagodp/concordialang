import { Database } from '../ast/Database';
import { DatabaseInterface } from './DatabaseInterface';
import { RuntimeException } from '../req/RuntimeException';
import { DatabaseWrapper } from './DatabaseWrapper';
import { LocatedException } from '../req/LocatedException';
import { Spec } from '../ast/Spec';
import { ConnectionCheckResult, ConnectionResult } from '../req/ConnectionResult';

/**
 * Checks all the connections of a specification.
 * 
 * @author Thiago Delgado Pinto
 */
export class ConnectionChecker {

    async check( spec: Spec ): Promise< ConnectionCheckResult > {

        let r: ConnectionCheckResult = new ConnectionCheckResult( true );

        for ( let doc of spec.docs ) {

            // Sanity checking
            if ( ! doc.databases ) {
                continue;
            }

            for ( let db of doc.databases ) {

                let dbi: DatabaseInterface = this.createDBI( db );

                let cr: ConnectionResult = {
                    success: true,
                    databaseName: db.name,
                    dbi: dbi
                } as ConnectionResult;

                ( db as Database ).connectionResult = cr;
                r.resultsMap[ db.name ] = cr;

                // connect
                try {
                    await dbi.connect( db );
                } catch ( err ) {
                    r.success = false;
                    cr.success = false;
                    const msg = 'Could not connect to the database "' + db.name + '". Reason: ' + err.message;
                    doc.fileWarnings.push( new RuntimeException( msg, db.location ) );
                    continue;
                }
                // disconnect
                try {
                    if ( await dbi.isConnected() ) {
                        await dbi.disconnect();
                    }
                } catch ( err ) {
                    const msg = 'Error while disconnecting from database "' +
                        db.name + '". Details: ' + err.message;
                    doc.fileWarnings.push( new RuntimeException( msg, db.location ) );
                }
            }
        }
        return r;
    }


    createDBI = ( db: Database ): DatabaseInterface => {
        // In the future, other implementation could be selected, according to the database type
        return new DatabaseWrapper();
    };

}