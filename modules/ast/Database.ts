import { ConnectionResult } from '../req/ConnectionResult';
import { HasItems, HasValue, NamedNode } from './Node';
import { ListItem } from './ListItem';

// Example:
// ```
// Database: My Test DB
//   - type is "mysql"
//   - path is "mytestdb"
//   - host is "127.0.0.1"
//   - username is "admin"
//   - password is "adminpass"
//   - charset is "UTF-8"
// ```

/**
 * Database node.
 *
 * @author Thiago Delgado Pinto
 */
export interface Database extends NamedNode, HasItems< DatabaseProperty > {
    connectionResult: ConnectionResult;
}

/**
 * Database item node.
 *
 * @author Thiago Delgado Pinto
 */
export interface DatabaseProperty extends ListItem, HasValue {
    property: string;
}

/**
 * Database properties.
 *
 * Files could also be represented as a database, using "type", "path", and maybe "options".
 * Example: { type: 'json', path: 'C://path/to/file.json' }
 *
 * @author Thiago Delgado Pinto
 */
export enum DatabaseProperties {
    TYPE = 'type', // should work as a "driver". e.g. 'mysql', 'mongodb', ...
    PATH = 'path', // also serves as "name" or "alias"
    HOST = 'host',
    PORT = 'port',
    USERNAME = 'username',
    PASSWORD = 'password',
    CHARSET = 'charset',
    OPTIONS = 'options'
}