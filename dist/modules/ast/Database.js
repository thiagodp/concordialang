/**
 * Database properties.
 *
 * Files could also be represented as a database, using "type", "path", and maybe "options".
 * Example: { type: 'json', path: 'C://path/to/file.json' }
 *
 * @author Thiago Delgado Pinto
 */
export var DatabaseProperties;
(function (DatabaseProperties) {
    DatabaseProperties["TYPE"] = "type";
    DatabaseProperties["PATH"] = "path";
    DatabaseProperties["HOST"] = "host";
    DatabaseProperties["PORT"] = "port";
    DatabaseProperties["USERNAME"] = "username";
    DatabaseProperties["PASSWORD"] = "password";
    DatabaseProperties["CHARSET"] = "charset";
    DatabaseProperties["OPTIONS"] = "options";
})(DatabaseProperties || (DatabaseProperties = {}));
export var DatabasePropertyAlias;
(function (DatabasePropertyAlias) {
    DatabasePropertyAlias["NAME"] = "name"; // alias for "path"
})(DatabasePropertyAlias || (DatabasePropertyAlias = {}));
