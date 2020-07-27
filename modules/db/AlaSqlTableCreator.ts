import * as alasql from 'alasql';
import { Table } from "../ast";
import { RuntimeException } from "../error";
import { isDefined, ValueType, ValueTypeDetector } from "../util";
import { AlaSqlDatabase } from './AlaSqlTypes';
import { SqlHelper } from "./SqlHelper";



/**
 * Creates database tables from Table nodes.
 *
 * @author Thiago Delgado Pinto
 */
export class AlaSqlTableCreator {

    private readonly _sqlHelper: SqlHelper = new SqlHelper();
    private readonly _valueTypeDetector: ValueTypeDetector = new ValueTypeDetector();

    /**
     * Creates a table from a database connection and a table node.
     *
     * @param dbConnection Database connection
     * @param table Table node
     */
    async createTableFromNode( dbConnection: AlaSqlDatabase, table: Table ): Promise< boolean > {

        const rowCount = table.rows.length;
        if ( rowCount < 2 ) {
            const msg = `Table "${table.name}" must have at least two rows: the first one with column names and second one with values.`;
            throw new RuntimeException( msg, table.location );
        }

        // Detect value types in the first data row, to create the table

        const columnRow = table.rows[ 0 ];
        // const firstDataRow = table.rows[ 1 ];
        // const valTypes: ValueType[] = this._valueTypeDetector.detectAll( firstDataRow.cells );
        const valTypes = this.detectTableColumnTypes( table );

        const sqlTypes = valTypes.map( v => this._sqlHelper.convertToSQLType( v ) );
        const sqlColumns = this._sqlHelper.generateSqlColumns( columnRow.cells, sqlTypes );
        const createCommand = this._sqlHelper.generateCreateWithTypes( table.internalName, sqlColumns );
        try {
            // console.log( 'TABLE CREATION COMMAND: ', createCommand );
            dbConnection.exec( createCommand ); // Creates the table if it does not exist
        } catch ( e ) {
            const msg = `Error creating the table "${table.name}": ${e.message}`;
            throw new RuntimeException( msg, table.location );
        }

        // Prepares a parameterized insert

        const insertCommand = this._sqlHelper.generateParameterizedInsert(
            table.internalName, columnRow.cells );
        // @ts-ignore
        let insert = alasql.compile( insertCommand );
        if ( ! isDefined( insert ) ) {
            const msg = `Error compiling the insert command at the table "${table.name}".`;
            throw new RuntimeException( msg, table.location );
        }

        // Inserts the values

        for ( let i = 1; i < rowCount; ++i ) { // starts at the second row
            const row = table.rows[ i ];
            try {
                // console.log( 'row', row );
                let params = this.adjustValuesToTheRightTypes( row.cells, valTypes );
                // console.log( 'params', params );
                insert( params );
            } catch ( e ) {
                const msg = `Error inserting values in the table "${table.name}": ${e.message}`;
                throw new RuntimeException( msg, table.location );
            }
        }

        // console.log( createCommand, "\n", insertCommand );
        return true;
    }

    detectTableColumnTypes( table: Table ): ValueType[] {
        let valTypes: ValueType[] = [];
        const rowCount = table.rows.length;
        for ( let i = 1; i < rowCount; ++i ) {
            let row = table.rows[ i ];
            let currentTypes = this._valueTypeDetector.detectAll( row.cells );
            if ( valTypes.length < 1 ) {
                valTypes = currentTypes;
                continue;
            }
            // Compare
            for ( let j = 0; j < currentTypes.length; ++j ) {
                if ( currentTypes[ j ] === valTypes[ j ] ) {
                    continue;
                }
                // Different -> string prevails
                if ( currentTypes[ j ] === ValueType.STRING ) {
                    valTypes[ j ] = currentTypes[ j ];
                }
            }
        }
        return valTypes;
    }


    adjustValuesToTheRightTypes( values: any[], types: ValueType[] ): any[] {
        const typesLen = types.length;
        let i = 0, adjusted: any[] = [];
        for ( let val of values ) {
            if ( i < typesLen ) {
                adjusted.push( this.adjustValueToTheRightType( val, types[ i ] ) );
            } else {
                adjusted.push( val );
            }
            ++i;
        }
        return adjusted;
    }


    adjustValueToTheRightType( value: any, type: ValueType ): any {
        const detectedType = this._valueTypeDetector.detect( value );
        switch ( detectedType ) {
            case ValueType.BOOLEAN: return this._valueTypeDetector.isTrue( value );
            case ValueType.INTEGER: return parseInt( value );
            case ValueType.DOUBLE: return parseFloat( value );
            default: return value;
        }
    }


}
