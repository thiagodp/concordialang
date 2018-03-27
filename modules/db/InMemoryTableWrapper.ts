import { InMemoryTableInterface } from "../req/InMemoryTableInterface";
import * as alasql from 'alasql';
import { Table } from "../ast/Table";
import { ValueType, ValueTypeDetector } from "../util/ValueTypeDetector";
import { SqlHelper } from "./SqlHelper";
import { isDefined } from "../util/TypeChecking";
import { RuntimeException } from "../req/RuntimeException";

// @ts-ignore
type TargetInMemoryDB = alasql.Database;

/**
 * In-memory table wrapper
 *
 * @author Thiago Delgado Pinto
 */
export class InMemoryTableWrapper implements InMemoryTableInterface {

    private readonly _db: TargetInMemoryDB;

    private readonly _valueTypeDetector: ValueTypeDetector = new ValueTypeDetector();
    private readonly _sqlHelper: SqlHelper = new SqlHelper();

    constructor(
        private _internalDatabaseName = 'concordia'
    ) {
        // @ts-ignore
        this._db = new alasql.Database( _internalDatabaseName );
        alasql( this._sqlHelper.generateUse( _internalDatabaseName ) );
    }

    /** @inheritDoc */
    async isConnected(): Promise< boolean > {
        return true; // currently always true
    }

    /** @inheritDoc */
    async connect( table: Table ): Promise< void > {
        await this.createFromNode( table );
    }

    /** @inheritDoc */
    async disconnect(): Promise< void > {
        // Currently does nothing
    }

    /** @inheritDoc */
    async query( cmd: string, params?: any ): Promise< any[] > {

        return new Promise< any[] >( ( resolve, reject ) => {
            try {
                this._db.exec(
                    cmd,
                    params,
                    ( data ) => resolve( data )
                );
            } catch ( e ) {
                reject( e );
            }

        } );
    }


    async createFromNode( table: Table ): Promise< void > {

        const rowCount = table.rows.length;
        if ( rowCount < 2 ) {
            const msg = `Table "${table.name}" must have at least two rows: the first one with column names and second one with values.`;
            throw new RuntimeException( msg, table.location );
        }

        // Detect value types in the first data row, to create the table

        const columnRow = table.rows[ 0 ];
        const firstDataRow = table.rows[ 1 ];
        const valTypes: ValueType[] = this._valueTypeDetector.detectAll( firstDataRow.cells );
        const sqlTypes = valTypes.map( v => this._sqlHelper.convertToSQLType( v ) );
        const sqlColumns = this._sqlHelper.generateSqlColumns( columnRow.cells, sqlTypes );
        const createCommand = this._sqlHelper.generateCreateWithTypes( table.internalName, sqlColumns );
        try {
            this._db.exec( createCommand ); // Creates the table if it does not exist
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
                insert( this.normalizeValues( row.cells, valTypes ) );
            } catch ( e ) {
                const msg = `Error inserting values in the table "${table.name}": ${e.message}`;
                throw new RuntimeException( msg, table.location );
            }
        }

        //console.log( createCommand, "\n", insertCommand );
    }


    normalizeValues( values: any[], types: ValueType[] ): any[] {
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


    normalizeValue( value: any, type: ValueType ): any {
        switch ( type ) {
            case ValueType.BOOLEAN: return this._valueTypeDetector.isTrue( value );
            case ValueType.INTEGER: return parseInt( value );
            case ValueType.DOUBLE: return parseFloat( value );
            default: return value;
        }
    }

}