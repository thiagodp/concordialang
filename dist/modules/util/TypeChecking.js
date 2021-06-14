export function isString(val) {
    return typeof val === 'string'
        || ((isDefined(val) && 'object' === typeof val) && '[object String]' === Object.prototype.toString.call(val));
}
export function isNumber(val) {
    return isDefined(val) && !isNaN(val);
}
export function isDefined(val) {
    return typeof val != 'undefined' && val !== null;
}
export function valueOrNull(val) {
    return isDefined(val) ? val : null;
}
