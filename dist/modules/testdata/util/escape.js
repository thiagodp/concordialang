"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
// Inspired in https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly/7760578#7760578
//
// Adapted for Concordia needs.
//
function escapeChar(char) {
    switch (char) {
        // special
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        // symbols
        case '\"': ; // continue
        case '\'': ; // escape "single quotes" because of database values
        case '\%': ; // escape "percent" because of database values
        case '\<': ; // escape "less than" because of ui literals
        case '\>': ; // escape "greater than" because of ui literals
        case '\\': return '\\' + char;
    }
    return char;
}
function escapeString(str) {
    //return str.replace( /[\0\x08\x09\x1a\n\r"'\\\%]/g, escapeChar );
    const charsToReplace = /[\0\x08\x09\x1a\n\r"'\\><]/g;
    let newStr = str.replace(charsToReplace, escapeChar);
    // Replace unbalanced backslash
    newStr = newStr.replace(/[^\\](\\\\\\)[^\\]/g, '\\\\');
    // Check unbalanced escaped quotes
    const isQuoteCountEven = countMatches(/\\"/g, newStr) % 2 == 0;
    if (!isQuoteCountEven) {
        newStr = newStr.replace(/\\"/, ''); // just the first one
    }
    // Check unbalanced escaped single quotes
    const isEscapedSingleQuoteCountEven = countMatches(/\\'/g, newStr) % 2 == 0;
    if (!isEscapedSingleQuoteCountEven) {
        newStr = newStr.replace(/\\'/, ''); // just the first one
    }
    // Check unbalanced single quotes
    const isSingleQuoteCountEven = countMatches(/'/g, newStr) % 2 == 0;
    if (!isSingleQuoteCountEven) {
        newStr = newStr.replace(/'/, ''); // just the first one
    }
    return newStr;
}
exports.escapeString = escapeString;
function countMatches(regex, text) {
    return ((text || '').match(regex) || []).length;
}
exports.countMatches = countMatches;
function escapeJson(json) {
    return JSON.stringify({ _: json }).slice(6, -2);
}
exports.escapeJson = escapeJson;
