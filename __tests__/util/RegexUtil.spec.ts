import { RegexUtil } from '../../modules/util/RegexUtil';

describe( 'RegexUtil', () => {

    let ru = new RegexUtil();

    it( 'returns the full match and group match by default', () => {
        let r = ru.matches( /(foo)/, 'foo' );
        expect( r ).toEqual( [ 'foo', 'foo' ] );
    } );

    it( 'can ignore full matches', () => {
        let r = ru.matches( /(foo)/, 'foo', true );
        expect( r ).toEqual( [ 'foo' ] );
    } );

} );