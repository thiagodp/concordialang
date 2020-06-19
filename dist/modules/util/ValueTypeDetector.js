"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustValueToTheRightType = exports.ValueTypeDetector = exports.ValueType = void 0;
const core_1 = require("@js-joda/core");
const date_time_validation_1 = require("./date-time-validation");
/**
 * Value type.
 *
 * @author Thiago Delgado Pinto
 */
var ValueType;
(function (ValueType) {
    ValueType["STRING"] = "string";
    ValueType["INTEGER"] = "integer";
    ValueType["DOUBLE"] = "double";
    ValueType["DATE"] = "date";
    ValueType["TIME"] = "time";
    // SHORT_TIME = 'short_time', // HH:mm
    ValueType["LONG_TIME"] = "longtime";
    ValueType["DATE_TIME"] = "datetime";
    // SHORT_DATETIME = 'short_datetime', // yyyy/MM/dd HH:mm
    ValueType["LONG_DATE_TIME"] = "longdatetime";
    ValueType["BOOLEAN"] = "boolean";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
/**
 * Value type detector.
 *
 * @author Thiago Delgado Pinto
 */
class ValueTypeDetector {
    isTrue(val) {
        return true === val || 'true' === val.toString().toLowerCase();
    }
    isFalse(val) {
        return false === val || 'false' === val.toString().toLowerCase();
    }
    isBoolean(val) {
        return this.isTrue(val) || this.isFalse(val);
    }
    isNumber(val) {
        return this.isDouble(val);
    }
    isInteger(val) {
        const valueType = typeof val;
        if ('number' === valueType || 'string' === valueType) {
            return (new RegExp('^-?[0-9]+$')).test(val); // convert to string before testing
        }
        return false;
    }
    isDouble(val) {
        const valueType = typeof val;
        if ('number' === valueType) {
            return true;
        }
        if ('string' === valueType) {
            return (new RegExp('^(-?[0-9]+(?:.[0-9]+)?)$')).test(val);
        }
        return false;
    }
    isDate(val) {
        const valueType = typeof val;
        if ('object' === valueType && (val instanceof Date || val instanceof core_1.LocalDate)) {
            return true;
        }
        if ('string' === valueType) {
            return date_time_validation_1.isValidDate(val);
        }
        return false;
    }
    isTime(val) {
        const valueType = typeof val;
        if ('object' === valueType && (val instanceof Date || val instanceof core_1.LocalTime)) {
            return true;
        }
        if ('string' === valueType) {
            return date_time_validation_1.isShortTime(val);
        }
        return false;
    }
    isLongTime(val) {
        const valueType = typeof val;
        if ('object' === valueType && (val instanceof Date || val instanceof core_1.LocalTime)) {
            return true;
        }
        if ('string' === valueType) {
            return date_time_validation_1.isValidTime(val) && !date_time_validation_1.isShortTime(val);
        }
        return false;
    }
    isDateTime(val) {
        const valueType = typeof val;
        if ('object' === valueType && (val instanceof Date || val instanceof core_1.LocalDateTime)) {
            return true;
        }
        if ('string' === valueType) {
            return date_time_validation_1.isShortDateTime(val);
        }
        return false;
    }
    isLongDateTime(val) {
        const valueType = typeof val;
        if ('object' === valueType && (val instanceof Date || val instanceof core_1.LocalDateTime)) {
            return true;
        }
        if ('string' === valueType) {
            return date_time_validation_1.isValidDateTime(val) && !date_time_validation_1.isShortDateTime(val);
        }
        return false;
    }
    detect(val) {
        if (this.isBoolean(val)) {
            return ValueType.BOOLEAN;
        }
        if (this.isInteger(val)) {
            return ValueType.INTEGER;
        }
        if (this.isDouble(val)) {
            return ValueType.DOUBLE;
        }
        if (this.isDateTime(val)) { // it must be before isLongDateTime
            return ValueType.DATE_TIME;
        }
        if (this.isLongDateTime(val)) {
            return ValueType.LONG_DATE_TIME;
        }
        if (this.isDate(val)) {
            return ValueType.DATE;
        }
        if (this.isTime(val)) { // it must be before isLongTime
            return ValueType.TIME;
        }
        if (this.isLongTime(val)) {
            return ValueType.LONG_TIME;
        }
        if (Array.isArray(val)) {
            if (val.length > 0) {
                return this.detect(val[0]);
            }
        }
        return ValueType.STRING;
    }
    detectAll(values) {
        return values.map(v => this.detect(v));
    }
}
exports.ValueTypeDetector = ValueTypeDetector;
/**
 * Adjust the value according to the given or detected value type.
 *
 * @param v Value to adjust.
 * @param valueType Desired value type. Optional. If not informed, the type is detected.
 */
function adjustValueToTheRightType(v, valueType, formatters) {
    const vType = valueType || (new ValueTypeDetector()).detect(v.toString().trim());
    let valueAfter;
    switch (vType) {
        case ValueType.INTEGER: // next
        case ValueType.DOUBLE: {
            valueAfter = Number(v) || 0;
            break;
        }
        case ValueType.DATE: {
            // try {
            //     valueAfter = LocalDate.parse( v );
            // } catch {
            //     valueAfter = LocalDate.now();
            // }
            const defaultFormatter = core_1.DateTimeFormatter.ofPattern("uuuuu-MM-dd");
            const formattersToUse = [...(formatters || []), defaultFormatter, undefined];
            let success = false;
            for (const fmt of formattersToUse) {
                try {
                    valueAfter = core_1.LocalDate.parse(v, fmt);
                    success = true;
                    break;
                }
                catch (_a) {
                    // ignore
                }
            }
            if (!success) {
                valueAfter = core_1.LocalDate.now();
            }
            break;
        }
        case ValueType.LONG_TIME:
        case ValueType.TIME: {
            try {
                valueAfter = core_1.LocalTime.parse(v);
            }
            catch (_b) {
                valueAfter = core_1.LocalTime.now();
            }
            break;
        }
        case ValueType.LONG_DATE_TIME:
        case ValueType.DATE_TIME: {
            try {
                valueAfter = core_1.LocalDateTime.parse(v);
            }
            catch (_c) {
                valueAfter = core_1.LocalDateTime.now();
            }
            break;
        }
        // Boolean should not be handle here, because there is an NLP entity for it.
        // Anyway, we will provide a basic case.
        case ValueType.BOOLEAN: {
            valueAfter = ['true', 'yes'].indexOf(v.toLowerCase()) >= 0;
            break;
        }
        default: valueAfter = v;
    }
    return valueAfter;
}
exports.adjustValueToTheRightType = adjustValueToTheRightType;
