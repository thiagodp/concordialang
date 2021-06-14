// import * as moment from 'moment';
import { DateTimeFormatter, LocalDate, ResolverStyle } from "@js-joda/core";
/**
 * Fill a value with zeros (left side).
 *
 * @param value Value to fill
 * @param maxLength Maximum length
 */
export function fillWithZero(value, maxLength) {
    let diff = maxLength - (value?.length || 0);
    if (diff < 0) {
        diff = 0;
    }
    return '0'.repeat(diff) + value;
}
/**
 * Returns `true` whether the given date format and value are considered valid.
 *
 * Formats: `"year/month/day"` or `"year-month-day"`
 *
 * @param value Value to check
 */
export function isValidDate(value) {
    if (!value) {
        return false;
    }
    // return moment( value, 'YYYY-MM-DD', true ).isValid()
    //     || moment( value, 'YYYY/MM/DD', true ).isValid()
    //     || moment( value, 'YYYY.MM.DD', true ).isValid()
    //     ;
    const makeDateRegex = function (separator) {
        if (1 === separator.length) {
            separator = '\\' + separator;
        }
        const sep = '(?:' + separator + ')';
        // year, month, day
        return new RegExp(`^[0-9]{1,4}${sep}(0?[1-9]|1[012])${sep}(0?[1-9]|[12][0-9]|3[01])$`);
    };
    const SLASH_PATTERN = DateTimeFormatter.ofPattern("uuuu/MM/dd")
        .withResolverStyle(ResolverStyle.STRICT);
    const DASH_PATTERN = DateTimeFormatter.ofPattern("uuuu-MM-dd")
        .withResolverStyle(ResolverStyle.STRICT);
    const patterns = [SLASH_PATTERN, DASH_PATTERN];
    const separators = ['/', '-'];
    for (let i = 0, len = separators.length; i < len; ++i) {
        const sep = separators[i];
        if (makeDateRegex(sep).test(value)) {
            let [year, month, day] = value.split(sep);
            year = fillWithZero(year, 4);
            month = fillWithZero(month, 2);
            day = fillWithZero(day, 2);
            const newDate = year + sep + month + sep + day;
            const pattern = patterns[i];
            try {
                LocalDate.parse(newDate, pattern);
                return true;
            }
            catch {
                return false;
            }
        }
    }
    return false;
}
/**
 * Returns `true` whether the given time format and value are considered valid.
 *
 * Formats: `"hour:minute"` or `"hour:minute:second"` or `"hour:minute:second.millisecond"`
 *
 * @param value Value to check
 */
export function isValidTime(value) {
    if (!value) {
        return false;
    }
    // return moment( value, 'HH:mm', true ).isValid()
    //     || moment( value, 'HH:mm:ss', true ).isValid()
    //     || moment( value, 'HH:mm:ss.SSS', true ).isValid()
    //     ;
    const regex = /^([01]?[0-9]|2[0-3])\:[0-5]?[0-9](\:[0-5]?[0-9])?(\.[0-9]{1,3})?$/;
    return regex.test(value);
}
/**
 * Returns `true` whether the given date and time formats and value are considered valid.
 *
 * See `isValidDate` and `isValidTime` for date and time formats. There must be
 * a space (" ") separating both.
 *
 * @param value Value to check
 */
export function isValidDateTime(value) {
    // const v = value.trim();
    // if ( ! v.indexOf( ' ' ) ) {
    //     if ( moment( val, moment.ISO_8601, true ).isValid() ) {
    //         return true;
    //     }
    //     return false;
    // }
    // const dt = v.split( ' ' );
    // if ( dt.length < 2 ) {
    //     return false;
    // }
    // return isValidDate( dt[ 0 ] ) && isValidTime( dt[ 1 ] );
    const [date, time] = splitDateAndTime(value);
    return isValidDate(date) && isValidTime(time);
}
export function isShortTime(value) {
    if (!value) {
        return false;
    }
    const regex = /^([01]?[0-9]|2[0-3])\:[0-5]?[0-9]$/;
    return regex.test(value);
}
export function isShortDateTime(value) {
    if (!value) {
        return false;
    }
    const [date, time] = splitDateAndTime(value);
    return isValidDate(date) && isShortTime(time);
}
function splitDateAndTime(value) {
    // Accepts more than one space between the date and the time
    const [date, time] = value.split(' ').filter(v => v.trim().length > 0);
    return [date, time];
}
