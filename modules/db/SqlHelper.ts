import { ValueType, ValueTypeDetector } from "../util/ValueTypeDetector";

/**
 * SQL helper.
 *
 * @author Thiago Delgado Pinto
 */
export class SqlHelper {

    private _valueTypeDetector: ValueTypeDetector = new ValueTypeDetector();

    public generateUse( name: string ): string {
        return 'USE `' + name + '`;';
    }

    public generateCreate( name: string, columns: string[] ): string {
        return 'CREATE TABLE IF NOT EXISTS `' + name + '` ' + '( `' + columns.join( '`, `' ) + '` );';
    }

    public generateCreateWithTypes( name: string, sqlColumns: string[] ): string {
        return 'CREATE TABLE IF NOT EXISTS `' + name + '` ( ' + sqlColumns.join( ', ' ) + ' );';
    }

    public generateDrop( name: string ): string {
        return 'DROP TABLE `' + name + '`;';
    }

    public generateParameterizedInsert( name: string, columns: string[] ): string {
        return 'INSERT INTO `' + name + '` VALUES ( ' + columns.map( v => '?' ).join( ', ' ) + ' );';
    }

    public generateInsert( name: string, values: any[][] ): string {
        return 'INSERT INTO `' + name + '` VALUES '
            + this.linesToSqlInsertValues( values )
            + ';';
    }

    public lineToSqlInsertValues( line: any[] ): string {
        let content: any[] = [];
        for ( let val of line ) {
            if ( this._valueTypeDetector.isBoolean( val ) ) {
                content.push( val );
            } else if ( this._valueTypeDetector.isDouble( val ) ) {
                content.push( parseFloat( val ) );
            } else if ( this._valueTypeDetector.isInteger( val ) ) {
                content.push( parseInt( val ) );
            } else {
                content.push( '"' + val + '"' );
            }
        }
        return '( ' + content.join( ', ' ) + ' )';
    }

    public linesToSqlInsertValues( lines: any[][] ): string {
        return lines.map( val => this.lineToSqlInsertValues( val ) ).join( ', ' );
    }

    public convertToSQLType( t: ValueType ): string {
        switch ( t ) {
            case ValueType.BOOLEAN: return 'BOOLEAN';
            case ValueType.DOUBLE: return 'DOUBLE';
            case ValueType.INTEGER: return 'INT';
            case ValueType.DATE: return 'DATE';
            case ValueType.TIME: return 'TIME';
            case ValueType.DATETIME: return 'DATETIME';
            default: return 'STRING';
        }
    }

    public generateSqlColumns( columns: string[], sqlTypes: string[] ): string[] {
        const typesLen = sqlTypes.length;
        let i = 0, sqlColumns: string[] = [];
        for ( let col of columns ) {
            if ( i < typesLen ) {
                sqlColumns.push( '`' + col + '` ' + sqlTypes[ i ] );
            } else {
                sqlColumns.push( '`' + col + '` STRING' );
            }
            ++i;
        }
        return sqlColumns;
    }

}