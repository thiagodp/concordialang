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
    type: 'database' | 'file';
}

/**
 * Database node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Database extends DataSource, HasItems< DatabaseProperty > {
    type: 'database';

    databaseType: string; // should work as a "driver". e.g. 'mysql', 'mongodb', ...
    path: string; // should also work as an "alias"
    host?: string;
    port?: string;
    username?: string;
    password?: string;
    charset?: string;
    options?: string;
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
 * File node.
 * 
 * @author Thiago Delgado Pinto
 */
export interface File extends DataSource {
    type: 'file';
    
    fileType: string; // ex.: json, xml, csv
    path: string;
}