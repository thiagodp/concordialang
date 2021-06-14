/**
 * Commonly-used regular expressions.
 *
 * @author Thiago Delgado Pinto
 */
export class Expressions {
    /**
     * Escape characters to be used in a regex.
     *
     * @param text Text to be escaped.
     */
    static escape(text) {
        return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    /**
     * Return escaped values.
     *
     * @param values Values to be escaped.
     */
    static escapeAll(values) {
        return values.map((val) => Expressions.escape(val));
    }
    /**
     * Returns a string with a regex to contain all the possible characters
     * except the given ones.
     *
     * @param values Not desired values.
     */
    static anythingBut(values, modifiers = 'ug') {
        return new RegExp('^((?![' + values.join('') + ']).)*$', modifiers);
    }
}
Expressions.AT_LEAST_ONE_SPACE_OR_TAB_OR_COMMA = '(?:\t| |,)+'; // "?:" means "not remember"
Expressions.OPTIONAL_SPACES_OR_TABS = '(?:\t| )*'; // "?:" means "not remember"
Expressions.ANYTHING = '.*';
Expressions.SOMETHING_INSIDE_QUOTES = '("[^"\r\n]*")';
Expressions.A_NUMBER = '([0-9]+(\.[0-9]+)?)'; // integer or double
Expressions.AN_INTEGER_NUMBER = '([0-9]+)';
