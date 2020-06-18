"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isString(val) {
    return typeof val === 'string'
        || ((isDefined(val) && 'object' === typeof val) && '[object String]' === Object.prototype.toString.call(val));
}
exports.isString = isString;
function isNumber(val) {
    return isDefined(val) && !isNaN(val);
}
exports.isNumber = isNumber;
function isDefined(val) {
    return typeof val != 'undefined' && val !== null;
}
exports.isDefined = isDefined;
function valueOrNull(val) {
    return isDefined(val) ? val : null;
}
exports.valueOrNull = valueOrNull;
