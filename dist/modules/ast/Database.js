"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Database properties.
 *
 * Files could also be represented as a database, using "type", "path", and maybe "options".
 * Example: { type: 'json', path: 'C://path/to/file.json' }
 *
 * @author Thiago Delgado Pinto
 */
var DatabaseProperties;
(function (DatabaseProperties) {
    DatabaseProperties["TYPE"] = "type";
    DatabaseProperties["PATH"] = "path";
    DatabaseProperties["HOST"] = "host";
    DatabaseProperties["PORT"] = "port";
    DatabaseProperties["USERNAME"] = "username";
    DatabaseProperties["PASSWORD"] = "password";
    DatabaseProperties["CHARSET"] = "charset";
    DatabaseProperties["OPTIONS"] = "options";
})(DatabaseProperties = exports.DatabaseProperties || (exports.DatabaseProperties = {}));
