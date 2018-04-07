import * as moment from 'moment';
import { LocalDate, LocalTime, LocalDateTime } from 'js-joda';

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

export const ALL_VALUE_TYPES: ValueType[] = [
    ValueType.STRING,
    ValueType.INTEGER,
    ValueType.DOUBLE,
    ValueType.DATE,
    ValueType.TIME,
    ValueType.DATETIME,
    ValueType.BOOLEAN
];

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


/**
 * Adjust the value according to the given or detected value type.
 *
 * @param v Value to adjust.
 * @param valueType Desired value type. Optional. If not informed, the type is detected.
 */
export function adjustValueToTheRightType( v: string, valueType?: ValueType ): any {
    const vType: ValueType = valueType || ( new ValueTypeDetector() ).detect( v.trim() );
    let valueAfter: any;
    switch ( vType ) {
        case ValueType.INTEGER  : ; // continue
        case ValueType.DOUBLE   : valueAfter = Number( v ) || 0; break;
        case ValueType.DATE     : valueAfter = LocalDate.parse( v ) || LocalDate.now(); break;
        case ValueType.TIME     : valueAfter = LocalTime.parse( v ) || LocalTime.now(); break;
        case ValueType.DATETIME : valueAfter = LocalDateTime.parse( v ) || LocalDateTime.now(); break;
        // Boolean should not be handle here, because there is an NLP entity for it.
        // Anyway, we will provide a basic case.
        case ValueType.BOOLEAN  : valueAfter = [ 'true', 'yes' ].indexOf( v.toLowerCase() ) >= 0; break;

        default                 : valueAfter = v;
    }
    return valueAfter;
}