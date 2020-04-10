import { Database } from '../ast/Database';
import { ConnectionCheckResult, ConnectionResult, DatabaseInterface } from '../dbi';
import { ProblemMapper, RuntimeException } from '../error';
import { AugmentedSpec } from "../req/AugmentedSpec";
import { DatabaseJSDatabaseInterface } from './DatabaseJSDatabaseInterface';

/**
 * Checks all the connections of a specification.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseConnectionChecker2 {

    async check(
        spec: AugmentedSpec,
        problems: ProblemMapper,
        disconnectAfterConnecting: boolean = false
    ): Promise< ConnectionCheckResult > {

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
                    errors: [],
                    databaseName: db.name,
                    dbi: dbi
                } as ConnectionResult;

                r.resultsMap[ db.name ] = cr;

                // connect
                try {
                    await dbi.connect( db, spec.basePath );
                } catch ( err ) {

                    r.success = false;
                    cr.success = false;
                    const msg = 'Could not connect to the database "' + db.name + '". Reason: ' + err.message;

                    const e = new RuntimeException( msg, db.location );
                    cr.errors.push( e );

                    problems.addWarning( doc.fileInfo.path, e );

                    continue;
                }

                if ( ! disconnectAfterConnecting ) {
                    continue;
                }

                // disconnect
                try {
                    if ( await dbi.isConnected() ) {
                        await dbi.disconnect();
                    }
                } catch ( err ) {
                    const msg = 'Error while disconnecting from database "' +
                        db.name + '". Details: ' + err.message + ' at ' + err.stack;

                    const e = new RuntimeException( msg, db.location );
                    cr.errors.push( e );

                    problems.addWarning( doc.fileInfo.path, e );
                }
            }
        }
        return r;
    }


    createDBI = ( db: Database ): DatabaseInterface => {
        // In the future, other implementation could be selected, according to the database type
        return new DatabaseJSDatabaseInterface();
    };

}