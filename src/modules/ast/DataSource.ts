import { BlockItem } from './Block';
import { HasItems, HasValue, NamedNode } from './Node';
import { ListItem } from './ListItem';

// Example 1:
// ```
// Database: MyTestDB
//   - type is "mysql"
//   - host is "127.0.0.1"
//   - path is "mytestdb"
//   - username is "admin"
//   - password is "adminpass"
//   - charset is "UTF-8"
// ```
//
// Example 2
// ```
// File: MyFile
//   - path is "/path/to/myfile.json"
//   - encoding is "UTF-8"
// ```
//

/**
 * Data source node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface DataSource extends NamedNode {
}

/**
 * Database node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Database extends DataSource, HasItems< DatabaseProperty > {
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