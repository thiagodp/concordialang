"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConnectionType;
(function (ConnectionType) {
    ConnectionType[ConnectionType["IN_MEMORY_TABLE"] = 0] = "IN_MEMORY_TABLE";
    ConnectionType[ConnectionType["DATABASE"] = 1] = "DATABASE";
})(ConnectionType = exports.ConnectionType || (exports.ConnectionType = {}));
class ConnectionResult_ {
    constructor(type, intf, error) {
        this.type = type;
        this.intf = intf;
        this.error = error;
    }
    static forTable(intf, error = null) {
        return new ConnectionResult_(ConnectionType.IN_MEMORY_TABLE, intf, error);
    }
    static forDatabase(intf, error = null) {
        return new ConnectionResult_(ConnectionType.DATABASE, intf, error);
    }
}
exports.ConnectionResult_ = ConnectionResult_;
class ConnectionContext {
    constructor() {
        // Maps a database name or a table name to its connection result
        this.map = new Map();
    }
}
exports.ConnectionContext = ConnectionContext;
/**
 * Connection check result.
 *
 * @author Thiago Delgado Pinto
 */
class ConnectionCheckResult {
    constructor(success = false, resultsMap = {} // name => ConnectionResult
    ) {
        this.success = success;
        this.resultsMap = resultsMap;
    }
    /*
    add = ( name: string, r: ConnectionResult ): void => {
        this.resultsMap[ name ] = r;
    };

    withName = ( name: string ): ConnectionResult | undefined => {
        return this.resultsMap[ name ];
    };
    */
    succeededResults() {
        let results = [];
        for (let name in this.resultsMap) {
            let r = this.resultsMap[name];
            if (r.success) {
                results.push(r);
            }
        }
        return results;
    }
}
exports.ConnectionCheckResult = ConnectionCheckResult;
// ---
