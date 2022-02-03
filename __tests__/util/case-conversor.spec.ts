import { removeDiacritics } from '../../modules/util/case-conversor';

describe( 'case-conversor', () => {

    describe( '#removeDiacritics', () => {

		it.each( [
			[ 'àäãâáÀÄÃÂÁ', 'aaaaaAAAAA' ],
			[ 'çÇñÑ', 'cCnN' ],
		] )( '%s -> %s', ( given, expected ) => {
			const r  = removeDiacritics( given );
			expect( r ).toEqual( expected );
		} );

	} );

} );
