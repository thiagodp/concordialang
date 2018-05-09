"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlstring_1 = require("sqlstring");
const QueryParser_1 = require("../db/QueryParser");
/**
 * Query reference replacer
 *
 * @author Thiago Delgado Pinto
 */
class QueryReferenceReplacer {
    replaceConstantInQuery(query, variable, value) {
        const regex = this.makeNameRegex(variable);
        return query.replace(regex, this.wrapValue(value));
    }
    replaceUIElementInQuery(query, variable, value) {
        const regex = this.makeVarRegex(variable);
        return query.replace(regex, this.wrapValue(value));
    }
    replaceDatabaseInQuery(query, variable) {
        // Removes "FROM"
        const fromRegex = / from /gi;
        let newQuery = query.replace(fromRegex, '');
        // Removes the Database variable
        const dbNameRegex = this.makeNameRegex(variable);
        return newQuery.replace(dbNameRegex, '');
    }
    replaceTableInQuery(query, variable, internalName) {
        const regex = this.makeNameRegex(variable);
        return query.replace(regex, internalName);
    }
    wrapValue(content) {
        return sqlstring_1.escape(content);
    }
    // private wrapName( content: string ): string {
    //     return escapeId( content );
    // }
    makeVarRegex(name) {
        return (new QueryParser_1.QueryParser()).makeVariableRegex(name);
    }
    makeNameRegex(name) {
        return (new QueryParser_1.QueryParser()).makeNameRegex(name);
    }
}
exports.QueryReferenceReplacer = QueryReferenceReplacer;
//# sourceMappingURL=QueryReferenceReplacer.js.map