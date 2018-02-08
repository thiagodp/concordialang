import * as moment from 'moment';

/**
 * Value type.
 * 
 * @author Thiago Delgado Pinto
 */
export enum ValueType {
    STRING = 'string',    
    INTEGER = 'integer',
    DOUBLE = 'double',    
    DATE = 'date',
    TIME = 'time',
    DATETIME = 'datetime',
    BOOLEAN = 'boolean'
}

/**
 * Value type detector.
 * 
 * @author Thiago Delgado Pinto
 */
export class ValueTypeDetector {

    isTrue( val: any ): boolean {
        return true === val || 'true' === val.toString().toLowerCase();
    }

    isFalse( val: any ): boolean {
        return false === val || 'false' === val.toString().toLowerCase();
    }    

    isBoolean( val: any ): boolean {
        return this.isTrue( val ) || this.isFalse( val );
    }    

    isNumber( val: any ): boolean {
        return this.isDouble( val );
    }    

    isInteger( val: any ): boolean {
        const t = typeof val;
        if ( 'number' === t || 'string' === t  ) {
            return ( new RegExp( '^-?[0-9]+$' ) ).test( val ); // convert to string before testing
        }
        return false;
    }

    isDouble( val: any ): boolean {
        const t = typeof val;
        if ( 'number' === t ) { return true };
        if ( 'string' === t  ) {
            return ( new RegExp( '^(-?[0-9]+(?:.[0-9]+)?)$' ) ).test( val );
        }
        return false;        
    }

    isDate( val: any ): boolean {
        const t = typeof val;
        if ( 'object' === t && val instanceof Date ) { return true };
        if ( 'string' === t  ) {
            return moment( val, 'YYYY-MM-DD', true ).isValid()
                || moment( val, 'YYYY/MM/DD', true ).isValid()
                || moment( val, 'YYYY.MM.DD', true ).isValid()
                ;
        }
        return false;
    }

    isTime( val: any ): boolean {
        const t = typeof val;
        if ( 'object' === t && val instanceof Date ) { return true };
        if ( 'string' === t  ) {
            return moment( val, 'HH:mm', true ).isValid()
                || moment( val, 'HH:mm:ss', true ).isValid()
                || moment( val, 'HH:mm:ss.SSS', true ).isValid()
                ;
        }
        return false;
    }
    
    isDateTime( val: any ): boolean {
        const t = typeof val;
        if ( 'object' === t && val instanceof Date ) { return true };
        if ( 'string' === t  ) {
            const v = val.toString().trim();
            if ( ! v.indexOf( ' ' ) ) {
                if ( moment( val, moment.ISO_8601, true ).isValid() ) {
                    return true;
                }
                return false;
            }
            const dt = v.split( ' ' );
            if ( dt.length < 2 ) {
                return false;
            }
            return this.isDate( dt[ 0 ] ) && this.isTime( dt[ 1 ] );
        }
        return false;
    }

    detect( val: string ): ValueType {
        if ( this.isBoolean( val ) ) {
            return ValueType.BOOLEAN;
        } else if ( this.isInteger( val ) ) {
            return ValueType.INTEGER;
        } else if ( this.isDouble( val ) ) {
            return ValueType.DOUBLE;
        } else if ( this.isDateTime( val ) ) {
            return ValueType.DATETIME;
        } else if ( this.isDate( val ) ) {
            return ValueType.DATE;
        } else if ( this.isTime( val ) ) {
            return ValueType.TIME;
        }
        return ValueType.STRING;
    }

    detectAll( values: any[] ): ValueType[] {
        return values.map( v => this.detect( v ) );
    }

}