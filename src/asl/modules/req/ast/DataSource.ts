import { NamedASTNode } from './ASTNode';

// Example 1:
// ```
// Data Source "MyTestDB" is a database:
//   - type "mysql"
//   - host "127.0.0.1"
//   - path "mytestdb"
//   - username "admin"
//   - password "adminpass"
//   - charset "UTF-8"
// ```
//
// Example 2
// ```
// Data Source "MyFile" is a file:
//   - path "/path/to/myfile.json"
// ```
//

export interface DataSource extends NamedASTNode {
    type: 'database' | 'file';
}

export interface Database extends DataSource {
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

export interface File extends DataSource {
    type: 'file';
    fileType: 'json' | 'xml' | 'csv';
    path: string;
}