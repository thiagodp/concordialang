import { ConnectionCheckResult } from '../dbi';
import { RuntimeException } from '../error';
import { DatabaseJSDatabaseInterface } from './DatabaseJSDatabaseInterface';
/**
 * Checks all the connections of a specification.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseConnectionChecker {
    constructor() {
        this.createDBI = (db) => {
            // In the future, other implementation could be selected, according to the database type
            return new DatabaseJSDatabaseInterface();
        };
    }
    async check(spec, problems, disconnectAfterConnecting = false) {
        let r = new ConnectionCheckResult(true);
        for (let doc of spec.docs) {
            // Sanity checking
            if (!doc.databases) {
                continue;
            }
            for (let db of doc.databases) {
                let dbi = this.createDBI(db);
                let cr = {
                    success: true,
                    errors: [],
                    databaseName: db.name,
                    dbi: dbi
                };
                r.resultsMap[db.name] = cr;
                // connect
                try {
                    await dbi.connect(db, spec.basePath);
                }
                catch (err) {
                    r.success = false;
                    cr.success = false;
                    const msg = 'Could not connect to the database "' + db.name + '". Reason: ' + err.message;
                    const e = new RuntimeException(msg, db.location);
                    cr.errors.push(e);
                    problems.addWarning(doc.fileInfo.path, e);
                    continue;
                }
                if (!disconnectAfterConnecting) {
                    continue;
                }
                // disconnect
                try {
                    if (await dbi.isConnected()) {
                        await dbi.disconnect();
                    }
                }
                catch (err) {
                    const msg = 'Error while disconnecting from database "' +
                        db.name + '". Details: ' + err.message + ' at ' + err.stack;
                    const e = new RuntimeException(msg, db.location);
                    cr.errors.push(e);
                    problems.addWarning(doc.fileInfo.path, e);
                }
            }
        }
        return r;
    }
}
