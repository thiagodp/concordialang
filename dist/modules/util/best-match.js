"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortedMatches = exports.bestMatch = void 0;
/**
 * Returns the best match of a text compared to a list.
 *
 * @param text Text to compare.
 * @param values Values to compare.
 * @param comparingFunction Comparing function.
 */
function bestMatch(text, values, comparingFunction) {
    const [first] = sortedMatches(text, values, comparingFunction);
    return first || null;
}
exports.bestMatch = bestMatch;
/**
 * Returns a list of matches sorted by rating (descending).
 *
 * @param text Text to compare.
 * @param values Values to compare.
 * @param comparingFunction Comparing function.
 */
function sortedMatches(text, values, comparingFunction) {
    if (!text || !values || values.length < 1 || !comparingFunction) {
        return [];
    }
    return values
        .map((v, i) => ({ value: v, index: i, rating: comparingFunction(text, v) }))
        .sort((a, b) => b.rating - a.rating);
}
exports.sortedMatches = sortedMatches;
