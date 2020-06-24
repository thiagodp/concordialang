"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minLimitOfType = exports.maxLimitOfType = void 0;
const ValueTypeDetector_1 = require("../../util/ValueTypeDetector");
const LongLimits_1 = require("./LongLimits");
const DoubleLimits_1 = require("./DoubleLimits");
const StringLimits_1 = require("./StringLimits");
const DateLimits_1 = require("./DateLimits");
const TimeLimits_1 = require("./TimeLimits");
const DateTimeLimits_1 = require("./DateTimeLimits");
function maxLimitOfType(t) {
    switch (t) {
        case ValueTypeDetector_1.ValueType.BOOLEAN: return true;
        case ValueTypeDetector_1.ValueType.INTEGER: return LongLimits_1.LongLimits.MAX;
        case ValueTypeDetector_1.ValueType.DOUBLE: return DoubleLimits_1.DoubleLimits.MAX;
        case ValueTypeDetector_1.ValueType.STRING: return StringLimits_1.StringLimits.MAX;
        case ValueTypeDetector_1.ValueType.DATE: return DateLimits_1.DateLimits.MAX;
        case ValueTypeDetector_1.ValueType.TIME: return TimeLimits_1.ShortTimeLimits.MAX;
        case ValueTypeDetector_1.ValueType.LONG_TIME: return TimeLimits_1.TimeLimits.MAX;
        case ValueTypeDetector_1.ValueType.DATE_TIME: return DateTimeLimits_1.ShortDateTimeLimits.MAX;
        case ValueTypeDetector_1.ValueType.LONG_DATE_TIME: return DateTimeLimits_1.DateTimeLimits.MAX;
        default: return null;
    }
}
exports.maxLimitOfType = maxLimitOfType;
function minLimitOfType(t) {
    switch (t) {
        case ValueTypeDetector_1.ValueType.BOOLEAN: return false;
        case ValueTypeDetector_1.ValueType.INTEGER: return LongLimits_1.LongLimits.MIN;
        case ValueTypeDetector_1.ValueType.DOUBLE: return DoubleLimits_1.DoubleLimits.MIN;
        case ValueTypeDetector_1.ValueType.STRING: return StringLimits_1.StringLimits.MIN;
        case ValueTypeDetector_1.ValueType.DATE: return DateLimits_1.DateLimits.MIN;
        case ValueTypeDetector_1.ValueType.TIME: return TimeLimits_1.ShortTimeLimits.MIN;
        case ValueTypeDetector_1.ValueType.LONG_TIME: return TimeLimits_1.TimeLimits.MIN;
        case ValueTypeDetector_1.ValueType.DATE_TIME: return DateTimeLimits_1.ShortDateTimeLimits.MIN;
        case ValueTypeDetector_1.ValueType.LONG_DATE_TIME: return DateTimeLimits_1.DateTimeLimits.MIN;
        default: return null;
    }
}
exports.minLimitOfType = minLimitOfType;
