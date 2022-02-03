import { escapeChar, escapeString } from '../../modules/testdata/util/escape';

describe( 'escape', () => {

	describe( '#escapeChar', () => {

		it( 'escapes a character', () => {
			expect( escapeChar( '>' ) ).toEqual( '\\>' );
		} );

	} );


	describe( '#escapeString', () => {

		it( 'check unbalanced backslash', () => {
			expect( escapeString( `\\foo` ) ).toEqual( `\\\\foo` );
		} );

		it( 'check unbalanced single quotes', () => {
			expect( escapeString( `'foo` ) ).toEqual( `foo` );
			expect( escapeString( `'foo'` ) ).toEqual( `\\'foo\\'` );
		} );

	} );

} );
