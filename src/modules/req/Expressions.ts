/**
 * Commonly-used regular expressions.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class Expressions {

    static AT_LEAST_ONE_SPACE_OR_TAB: string = '(?:\t| )+'; // "?:" means "not remember"
    static OPTIONAL_SPACES_OR_TABS: string = '(?:\t| )*'; // "?:" means "not remember"

    static ANYTHING: string = '.*';

    static SOMETHING_INSIDE_QUOTES = '("[^"\r\n]*")';

    static A_NUMBER = '([0-9]+(\.[0-9]+)?)'; // integer or double

    /**
     * Escape characters to be used in a regex.
     * 
     * @param text Text to be escaped.
     */
    public static escape( text: string ): string {
        return text.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
    }

    /**
     * Return escaped values.
     * 
     * @param values Values to be escaped.
     */    
    public static escapeAll( values: string[] ): string[] {
        return values.map( ( val ) => Expressions.escape( val ) );
    }

    /**
     * Returns a string with a regex to contain all the possible characters 
     * except the given ones.
     * 
     * @param values Not desired values.
     */
    public static anythingBut( values: string[], modifiers: string = 'ug' ): RegExp {
        return new RegExp( '^((?![' + values.join( '' ) + ']).)*$', modifiers );
    }
    
}