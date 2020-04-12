"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@js-joda/core");
const moment = require("moment");
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
    ValueType["DATETIME"] = "datetime";
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
        const t = typeof val;
        if ('number' === t || 'string' === t) {
            return (new RegExp('^-?[0-9]+$')).test(val); // convert to string before testing
        }
        return false;
    }
    isDouble(val) {
        const t = typeof val;
        if ('number' === t) {
            return true;
        }
        if ('string' === t) {
            return (new RegExp('^(-?[0-9]+(?:.[0-9]+)?)$')).test(val);
        }
        return false;
    }
    isDate(val) {
        const t = typeof val;
        if ('object' === t && (val instanceof Date || val instanceof core_1.LocalDate)) {
            return true;
        }
        if ('string' === t) {
            return moment(val, 'YYYY-MM-DD', true).isValid()
                || moment(val, 'YYYY/MM/DD', true).isValid()
                || moment(val, 'YYYY.MM.DD', true).isValid();
        }
        return false;
    }
    isTime(val) {
        const t = typeof val;
        if ('object' === t && (val instanceof Date || val instanceof core_1.LocalTime)) {
            return true;
        }
        if ('string' === t) {
            return moment(val, 'HH:mm', true).isValid()
                || moment(val, 'HH:mm:ss', true).isValid()
                || moment(val, 'HH:mm:ss.SSS', true).isValid();
        }
        return false;
    }
    isDateTime(val) {
        const t = typeof val;
        if ('object' === t && (val instanceof Date || val instanceof core_1.LocalDateTime)) {
            return true;
        }
        if ('string' === t) {
            const v = val.toString().trim();
            if (!v.indexOf(' ')) {
                if (moment(val, moment.ISO_8601, true).isValid()) {
                    return true;
                }
                return false;
            }
            const dt = v.split(' ');
            if (dt.length < 2) {
                return false;
            }
            return this.isDate(dt[0]) && this.isTime(dt[1]);
        }
        return false;
    }
    detect(val) {
        if (this.isBoolean(val)) {
            return ValueType.BOOLEAN;
        }
        else if (this.isInteger(val)) {
            return ValueType.INTEGER;
        }
        else if (this.isDouble(val)) {
            return ValueType.DOUBLE;
        }
        else if (this.isDateTime(val)) {
            return ValueType.DATETIME;
        }
        else if (this.isDate(val)) {
            return ValueType.DATE;
        }
        else if (this.isTime(val)) {
            return ValueType.TIME;
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
function adjustValueToTheRightType(v, valueType) {
    const vType = valueType || (new ValueTypeDetector()).detect(v.toString().trim());
    let valueAfter;
    switch (vType) {
        case ValueType.INTEGER: // next
        case ValueType.DOUBLE: {
            valueAfter = Number(v) || 0;
            break;
        }
        case ValueType.DATE: {
            try {
                valueAfter = core_1.LocalDate.parse(v);
            }
            catch (_a) {
                valueAfter = core_1.LocalDate.now();
            }
            break;
        }
        case ValueType.TIME: {
            try {
                valueAfter = core_1.LocalTime.parse(v);
            }
            catch (_b) {
                valueAfter = core_1.LocalTime.now();
            }
            break;
        }
        case ValueType.DATETIME: {
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
