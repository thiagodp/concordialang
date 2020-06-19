"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.millisToString = exports.millisObjectToString = exports.millisToObject = void 0;
/**
 * Converts a value in milliseconds to an object that may contain `day`, `hour`,
 * `min`, `sec`, and `ms`.
 *
 * @param ms Milliseconds
 * @returns object
 */
function millisToObject(ms) {
    if (ms < 1000) {
        return { ms: ms };
    }
    var _ms = ms % 1000;
    var factor = Math.floor(ms / 1000);
    var _sec = factor % 60;
    factor = Math.floor(factor / 60);
    var _min = factor % 60;
    if (0 === _min) {
        return { sec: _sec, ms: _ms };
    }
    factor = Math.floor(factor / 60);
    var _hour = factor % 60;
    if (0 === _hour) {
        return { min: _min, sec: _sec, ms: _ms };
    }
    factor = Math.floor(factor / 24);
    var _day = factor % 24;
    if (0 === _day) {
        return { hour: _hour, min: _min, sec: _sec, ms: _ms };
    }
    return { day: _day, hour: _hour, min: _min, sec: _sec, ms: _ms };
}
exports.millisToObject = millisToObject;
/**
 * Transform an object that contain time properties to a human-readable string.
 *
 * @param o Object with time properties.
 * @param i18n Object with strings for the time properties. Optional.
 * @param separator Character used as separator. Optional. Default is empty.
 * @returns string
 */
function millisObjectToString(o, i18n, separator) {
    i18n = i18n || {};
    separator = separator || '';
    var s = [];
    if (o.day)
        s.push(o.day + (i18n.day !== undefined ? i18n.day : 'd'));
    if (o.hour)
        s.push(o.hour + (i18n.hour !== undefined ? i18n.hour : 'h'));
    if (o.min)
        s.push(o.min + (i18n.min !== undefined ? i18n.min : 'm'));
    if (o.sec)
        s.push(o.sec + (i18n.sec !== undefined ? i18n.sec : 's'));
    if (o.ms)
        s.push(o.ms + (i18n.ms !== undefined ? i18n.ms : 'ms'));
    return s.join(separator);
}
exports.millisObjectToString = millisObjectToString;
/**
 * Transform a value in miliiseconds to a human-readable string.
 *
 * @param ms Value in milliseconds
 * @param i18n Object with strings for the time properties. Optional.
 * @param separator Character used as separator. Optional. Default is empty.
 * @returns string
 */
function millisToString(ms, i18n, separator) {
    return millisObjectToString(millisToObject(ms), i18n, separator);
}
exports.millisToString = millisToString;
