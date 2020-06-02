"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionCheckResult = void 0;
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
