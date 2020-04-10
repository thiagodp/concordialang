import { removeDuplicated } from '../../modules/util/remove-duplicated';

describe( 'removeDuplicated', () => {

    it( 'removes using strict equality by default', () => {
        let arr = [ 1, 2, 3, 2, 4 ];
        removeDuplicated( arr );
        expect( arr ).toEqual( [ 1, 2, 3, 4 ] );
    } );

    it( 'uses comparison function #1', () => {
        let arr = [ 1, 2, 3, 2, 4 ];
        removeDuplicated( arr, ( a, b ) => a === b );
        expect( arr ).toEqual( [ 1, 2, 3, 4 ] );
    } );

    it( 'uses comparison function #2', () => {
        let arr = [ 1, 1 ];
        removeDuplicated( arr, ( a, b ) => a === b );
        expect( arr ).toEqual( [ 1 ] );
    } );

    it( 'removes objects #1', () => {
        const e1 = new Error( '1' );
        const e2 = new Error( '2' );
        let arr = [ e1, e2, e1 ];
        removeDuplicated( arr, ( a, b ) => a.message === b.message );
        expect( arr ).toEqual( [ e1, e2 ] );
    } );

    it( 'removes objects #2', () => {
        const e1 = new Error( '1' );
        const e2 = new Error( '2' );
        let arr = [ e1, e1, e2, e1, e2, e2 ];
        removeDuplicated( arr, ( a, b ) => a.message === b.message );
        expect( arr ).toEqual( [ e1, e2 ] );
    } );

} );