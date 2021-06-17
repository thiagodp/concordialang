import { matches } from '../../modules/util/matches';

describe( '#matches', () => {

    it( 'returns the full match and group match by default', () => {
        let r = matches( /(foo)/, 'foo' );
        expect( r ).toEqual( [ 'foo', 'foo' ] );
    } );

    it( 'can ignore full matches', () => {
        let r = matches( /(foo)/, 'foo', true );
        expect( r ).toEqual( [ 'foo' ] );
    } );

} );
