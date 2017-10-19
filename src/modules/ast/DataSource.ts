import { BlockItem } from './Block';
import { HasItems,  NamedNode} from './Node';

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
export interface Database extends DataSource, HasItems< DatabaseItem > {
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
export interface DatabaseItem extends BlockItem {
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