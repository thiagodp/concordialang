
export function isString( val: any ): boolean {
    return typeof val === 'string'
        || ( ( isDefined( val ) && 'object' === typeof val ) && '[object String]' === Object.prototype.toString.call( val ) );
}

export function isNumber( val: any ): boolean {
    return isDefined( val ) && ! isNaN( val );
}

export function isDefined( val: any ): boolean {
    return typeof val != 'undefined' && val !== null;
}

export function valueOrNull< T >( val: T ): T | null {
    return isDefined( val ) ? val : null;
}
