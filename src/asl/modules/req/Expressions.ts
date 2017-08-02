/**
 * Commonly-used regular expressions.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class Expressions {

    static SPACES_OR_TABS: string = '(?:\t| )*'; // "?:" means "not remember"

    static ANYTHING: string = '.*';

    /**
     * Escape characters to be used in a regex.
     * 
     * @param text Text to be escaped.
     */
    public static escape( text: string ): string {
        return text.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
    }
    
}