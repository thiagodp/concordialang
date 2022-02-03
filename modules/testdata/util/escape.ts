//
// Inspired by https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly/7760578#7760578
//
// Adapted for Concordia needs.
//
export function escapeChar( char ) {
    switch ( char ) {
        // special
        case '\0'  : return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n'  : return '\\n';
        case '\r'  : return '\\r';
        // ui literals symbols
        case '<' : // escape because of ui literals
        case '>' : // escape because of ui literals
        // other symbols
        case '"' : // continue
        case "'" : // escape because of database values
        case '%' : // escape because of database values
        case '`' : // escape because of database values
        case '\\': return '\\' + char;
    }
    return char;
}

export function escapeString( str ): string {
    //return str.replace( /[\0\x08\x09\x1a\n\r"'\\\%]/g, escapeChar );
    const charsToReplace = /[\0\x08\x09\x1a\n\r"'\\><]/g;
    let newStr = str.replace( charsToReplace, escapeChar );
    // Replace unbalanced backslash
    newStr = newStr.replace( /[^\\](\\\\\\)[^\\]/g, '\\\\' );
    // Check unbalanced escaped quotes
    const isQuoteCountEven = countMatches( /\\"/g, newStr ) % 2 == 0;
    if ( ! isQuoteCountEven ) {
        newStr = newStr.replace( /\\"/, '' ); // just the first one
    }
    // Check unbalanced escaped single quotes
    const isEscapedSingleQuoteCountEven = countMatches( /\\'/g, newStr ) % 2 == 0;
    if ( ! isEscapedSingleQuoteCountEven ) {
        newStr = newStr.replace( /\\'/, '' ); // just the first one
    }
    // Check unbalanced single quotes
    const isSingleQuoteCountEven = countMatches( /'/g, newStr ) % 2 == 0;
    if ( ! isSingleQuoteCountEven ) {
        newStr = newStr.replace( /'/, '' ); // just the first one
    }
    return newStr;
}


export function countMatches( regex: RegExp, text: string ): number {
    return ( ( text || '' ).match( regex ) || [] ).length;
}

export function escapeJson( json: string ): string {
    return JSON.stringify( { _: json} ).slice( 6, -2 );
}
