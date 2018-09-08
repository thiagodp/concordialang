/**
 * Regex utilities.
 *
 * @author Thiago Delgado Pinto
 */
export class RegexUtil {

    /**
     * Returns matches, ignoring undefined values. It is capable of ignoring full matches.
     *
     * @param regex Regex
     * @param text Text
     * @param ignoresFullMatch Ignores the full match
     */
    public matches( regex: RegExp, text: string, ignoresFullMatch: boolean = false ): string[] {
        // Assures a global regex, to avoid infinite loop
        let rx: RegExp = ( regex.global ) ? regex : new RegExp( regex.source, 'g' );
        let results: string[] = [];
        let match: RegExpExecArray = null;
        while ( ( match = rx.exec( text ) ) !== null ) {
            // Add all the groups, but the full match
            results.push.apply( results, ignoresFullMatch
                ? match.filter( ( val, idx ) => !! val && idx > 0 )
                : match.filter( ( val ) => !! val )
                );
            // Avoid infinite loop
            rx.lastIndex = match.index + ( match[ 0 ].length || 1 );
        }
        return results;
    }

}