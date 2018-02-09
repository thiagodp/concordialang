
export function isString( val ) {
    return typeof val === 'string'
        || ( ( !! val && 'object' === typeof val ) && '[object String]' === Object.prototype.toString.call( val ) );
}

export function isNumber( val ) {
    return ! isNaN( val );
}