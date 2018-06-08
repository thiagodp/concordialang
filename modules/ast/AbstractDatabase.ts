/**
 * Abstract database connection
 *
 * Attributes are compatible with a JDBC-like interface, such as that provided by database-js.
 *
 * @author Thiago Delgado Pinto
 */
export interface AbstractDatabase {
    driverName: string;
    username?: string;
    password?: string;
    hostname?: string;
    port?: number | string;
    database: string;
    parameters?: string;
}