"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbi_1 = require("../dbi");
const error_1 = require("../error");
const DatabaseJSDatabaseInterface_1 = require("./DatabaseJSDatabaseInterface");
/**
 * Checks all the connections of a specification.
 *
 * @author Thiago Delgado Pinto
 */
class DatabaseConnectionChecker {
    constructor() {
        this.createDBI = (db) => {
            // In the future, other implementation could be selected, according to the database type
            return new DatabaseJSDatabaseInterface_1.DatabaseJSDatabaseInterface();
        };
    }
    check(spec, errors, disconnectAfterConnecting = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = new dbi_1.ConnectionCheckResult(true);
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
                        yield dbi.connect(db, spec.basePath);
                    }
                    catch (err) {
                        r.success = false;
                        cr.success = false;
                        const msg = 'Could not connect to the database "' + db.name + '". Reason: ' + err.message;
                        let e = new error_1.RuntimeException(msg, db.location);
                        cr.errors.push(e);
                        errors.push(e);
                        doc.fileWarnings.push(e);
                        continue;
                    }
                    if (!disconnectAfterConnecting) {
                        continue;
                    }
                    // disconnect
                    try {
                        if (yield dbi.isConnected()) {
                            yield dbi.disconnect();
                        }
                    }
                    catch (err) {
                        const msg = 'Error while disconnecting from database "' +
                            db.name + '". Details: ' + err.message + ' at ' + err.stack;
                        let e = new error_1.RuntimeException(msg, db.location);
                        cr.errors.push(e);
                        errors.push(e);
                        doc.fileWarnings.push(e);
                    }
                }
            }
            return r;
        });
    }
}
exports.DatabaseConnectionChecker = DatabaseConnectionChecker;
