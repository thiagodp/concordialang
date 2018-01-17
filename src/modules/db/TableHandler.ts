import { SqlHelper } from './SqlHelper';
import { normalize } from 'path';
import { Table } from '../ast/Table';
import { ValueType, ValueTypeDetector } from '../util/ValueTypeDetector';
import * as alasql from 'alasql';

/**
 * Creates a in-memory table from a table declared with Concordia.
 * 
 * @author Thiago Delgado Pinto
 */
export class TableHandler {

    public readonly DEFAULT_DB_NAME: string = 'concordia';

    private _valueTypeDetector: ValueTypeDetector = new ValueTypeDetector();
    private _sqlHelper: SqlHelper = new SqlHelper();

    constructor( private _dbName = undefined ) {
        if ( ! this._dbName ) {
            this._dbName = this.DEFAULT_DB_NAME;
        }
    }

    /**
     * Creates a database table from a table node.
     * 
     * @param table Table node
     * @return alasql.Database
     * 
     * @throws Error in case of exception.
     */
    public createFromNode( table: Table ): alasql.Database {
        /*
        // Convert
        const name = table.name;
        let columns: string[] = [];
        let lines: string[][] = [];
        let i = 0;
        for ( let row of table.rows ) {
            if ( 0 === i ) {
                columns = row.cells;
            } else {
                lines.push( row.cells );
            }
            ++i;
        }
        */
        // Creating/using the database
        let db = new alasql.Database( this._dbName );
        let insert: any = null;
        let i = 0;
        const rowCount = table.rows.length;
        let valTypes: ValueType[] = [];
        for ( let row of table.rows ) {
            if ( 0 === i ) {
                alasql( this._sqlHelper.generateUse( this._dbName ) );

                if ( rowCount > 1 ) {

                    valTypes = this._valueTypeDetector.detectAll( table.rows[ 1 ].cells );

                    const sqlTypes = valTypes.map( v => this._sqlHelper.convertToSQLType( v ) );

                    const sqlColumns = this._sqlHelper.generateSqlColumns( row.cells, sqlTypes );
                    //console.log( sqlColumns );
                    const createCommand = this._sqlHelper.generateCreateWithTypes( table.name, sqlColumns );

                    // Create the table if it does not exist
                    db.exec( createCommand );
                
                    // Prepare a parameterized insert
                    const insertCommand = this._sqlHelper.generateParameterizedInsert( table.name, row.cells );
                    //console.log( insertCommand );                    
                    insert = alasql.compile( insertCommand );

                } else {
                    // Create the table if it does not exist
                    const createCommand = this._sqlHelper.generateCreate( table.name, row.cells );
                    //console.log( createCommand );
                    db.exec( createCommand );
                }

            } else {
                if ( insert ) {
                    insert( this.normalizeValues( row.cells, valTypes ) );
                }
            }
            ++i;
        }
        return db;
    }


    public normalizeValues( values: any[], types: ValueType[] ): any[] {
        const typesLen = types.length;
        let i = 0, normalized: any[] = [];
        for ( let val of values ) {
            if ( i < typesLen ) {
                normalized.push( this.normalizeValue( val, types[ i ] ) );
            } else {
                normalized.push( val );
            }
            ++i;
        }
        return normalized;
    }

    
    public normalizeValue( value: any, type: ValueType ): any {
        switch ( type ) {
            case ValueType.BOOLEAN: return this._valueTypeDetector.isTrue( value );
            case ValueType.INTEGER: return parseInt( value );
            case ValueType.DOUBLE: return parseFloat( value );
            default: return value;
        }
    }

}