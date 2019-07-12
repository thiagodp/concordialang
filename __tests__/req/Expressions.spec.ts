import { Expressions } from "../../modules/req/Expressions";

describe( 'Expressions', () => {

    it( 'espaces a char for a regex correctly', () => {
        expect( Expressions.escape( '.' ) ).toBe( "\\." );
    } );

    it( 'espaces all chars for a regex correctly', () => {
        expect( Expressions.escapeAll( [ '.', '[' ] ) )
            .toEqual( [ "\\.", "\\[" ] );
    } );

    it( 'creates a regex to ignore the given characters', () => {
        let r = Expressions.anythingBut( [ '"' ] ).test( 'hello world' );
        expect( r ).toBeTruthy();

        r = Expressions.anythingBut( [ '"' ] ).test( 'hello "world' );
        expect( r ).toBeFalsy();
    } );


} );