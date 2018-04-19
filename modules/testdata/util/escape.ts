//
// Inspired in https://stackoverflow.com/questions/7744912/making-a-javascript-string-sql-friendly/7760578#7760578
//
// Adapted for Concordia needs.
//

function escapeChar( char ) {
    switch ( char ) {
        // special
        case '\0':      return '\\0';
        case '\x08':    return '\\b';
        case '\x09':    return '\\t';
        case '\x1a':    return '\\z';
        case '\n':      return '\\n';
        case '\r':      return '\\r';
        // symbols
        case '\"': ;    // continue
        // case '\'': ; // <-- do not escape single quote
        // case '%': ;  // continue
        case '\\':      return '\\' + char;
    }
    return char;
}

export function escapeString( str ) {
    return str.replace( /[\0\x08\x09\x1a\n\r"'\\\%]/g, escapeChar );
}