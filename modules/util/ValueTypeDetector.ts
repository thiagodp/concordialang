import { DateTimeFormatter, LocalDate, LocalDateTime, LocalTime } from "@js-joda/core";
import { isValidDate, isValidDateTime, isValidTime, isShortTime, isShortDateTime } from "./date-time-validation";

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

    TIME = 'time', // HH:mm:ss -> HH:mm (new)
    // SHORT_TIME = 'short_time', // HH:mm
    LONG_TIME = 'longtime', // HH:mm:ss

    DATE_TIME = 'datetime', // yyyy/MM/dd HH:mm:ss -> dd/MM/yyyy HH:mm (new)
    // SHORT_DATETIME = 'short_datetime', // yyyy/MM/dd HH:mm
    LONG_DATE_TIME = 'longdatetime', // yyyy/MM/dd HH:mm:ss

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
        const valueType = typeof val;
        if ( 'number' === valueType || 'string' === valueType  ) {
            return ( new RegExp( '^-?[0-9]+$' ) ).test( val ); // convert to string before testing
        }
        return false;
    }

    isDouble( val: any ): boolean {
        const valueType = typeof val;
        if ( 'number' === valueType ) {
            return true;
        }
        if ( 'string' === valueType  ) {
            return ( new RegExp( '^(-?[0-9]+(?:.[0-9]+)?)$' ) ).test( val );
        }
        return false;
    }

    isDate( val: any ): boolean {
        const valueType = typeof val;
        if ( 'object' === valueType && ( val instanceof Date || val instanceof LocalDate ) ) {
            return true;
        }
        if ( 'string' === valueType ) {
            return isValidDate( val );
        }
        return false;
    }

    isTime( val: any ): boolean {
        const valueType = typeof val;
        if ( 'object' === valueType && ( val instanceof Date || val instanceof LocalTime ) ) {
            return true;
        }
        if ( 'string' === valueType  ) {
            return isShortTime( val );
        }
        return false;
    }

    isLongTime( val: any ): boolean {
        const valueType = typeof val;
        if ( 'object' === valueType && ( val instanceof Date || val instanceof LocalTime ) ) {
            return true;
        }
        if ( 'string' === valueType  ) {
            return isValidTime( val ) && ! isShortTime( val );
        }
        return false;
    }

    isDateTime( val: any ): boolean {
        const valueType = typeof val;
        if ( 'object' === valueType && ( val instanceof Date || val instanceof LocalDateTime ) ) {
            return true;
        }
        if ( 'string' === valueType  ) {
            return isShortDateTime( val );
        }
        return false;
    }

    isLongDateTime( val: any ): boolean {
        const valueType = typeof val;
        if ( 'object' === valueType && ( val instanceof Date || val instanceof LocalDateTime ) ) {
            return true;
        }
        if ( 'string' === valueType  ) {
            return isValidDateTime( val ) && ! isShortDateTime( val );
        }
        return false;
    }

    detect( val: any ): ValueType {

        if ( this.isBoolean( val ) ) {
            return ValueType.BOOLEAN;
        }

        if ( this.isInteger( val ) ) {
            return ValueType.INTEGER;
        }

        if ( this.isDouble( val ) ) {
            return ValueType.DOUBLE;
        }

        if ( this.isDateTime( val ) ) { // it must be before isLongDateTime
            return ValueType.DATE_TIME;
        }

        if ( this.isLongDateTime( val ) ) {
            return ValueType.LONG_DATE_TIME;
        }

        if ( this.isDate( val ) ) {
            return ValueType.DATE;
        }

        if ( this.isTime( val ) ) { // it must be before isLongTime
            return ValueType.TIME;
        }

        if ( this.isLongTime( val ) ) {
            return ValueType.LONG_TIME;
        }

        if ( Array.isArray( val ) ) {
            if ( val.length > 0 ) {
                return this.detect( val[ 0 ] );
            }
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
export function adjustValueToTheRightType( v: string, valueType?: ValueType, formatters?: DateTimeFormatter[] ): any {
    const vType: ValueType = valueType || ( new ValueTypeDetector() ).detect( v.toString().trim() );
    let valueAfter: any;
    switch ( vType ) {

        case ValueType.INTEGER: // next

        case ValueType.DOUBLE: {
            valueAfter = Number( v ) || 0;
            break;
        }

        case ValueType.DATE: {
            // try {
            //     valueAfter = LocalDate.parse( v );
            // } catch {
            //     valueAfter = LocalDate.now();
            // }
            const defaultFormatter = DateTimeFormatter.ofPattern( "uuuuu-MM-dd" );
            const formattersToUse = [ ...( formatters || [] ), defaultFormatter, undefined ];
            let success = false;
            for ( const fmt of formattersToUse ) {
                try {
                    valueAfter = LocalDate.parse( v, fmt );
                    success = true;
                    break;
                } catch {
                    // ignore
                }
            }
            if ( ! success ) {
                valueAfter = LocalDate.now();
            }

            break;
        }

        case ValueType.LONG_TIME:
        case ValueType.TIME: {
            try {
                valueAfter = LocalTime.parse( v );
            } catch {
                valueAfter = LocalTime.now();
            }
            break;
        }

        case ValueType.LONG_DATE_TIME:
        case ValueType.DATE_TIME: {
            try {
                valueAfter = LocalDateTime.parse( v );
            } catch {
                valueAfter = LocalDateTime.now();
            }
            break;
        }

        // Boolean should not be handle here, because there is an NLP entity for it.
        // Anyway, we will provide a basic case.
        case ValueType.BOOLEAN: {
            valueAfter = [ 'true', 'yes' ].indexOf( v.toLowerCase() ) >= 0;
            break;
        }

        default: valueAfter = v;
    }
    return valueAfter;
}