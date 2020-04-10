/**
 * Remove duplicated items from contiguous arrays with same type.
 *
 * @author Thiago Delgado Pinto
 */
export function removeDuplicated< T >(
    arr: Array< T >,
    areEqual: ( a: T, b: T ) => boolean = ( a: T, b: T ) => a === b
): number {
    let removeCount = 0;
    for ( let end = arr.length; end >= 0; --end ) {
        const down = arr[ end ];
        if ( undefined === down ) {
            continue;
        }
        for ( let d = end - 1; d >= 0; --d ) {
            const prior = arr[ d ];
            if ( prior !== undefined && areEqual( down, prior ) ) {
                arr.splice( end, 1 );
                ++removeCount;
                break;
            }
        }
    }
    return removeCount;
}