import { removeDiacritics } from '../../modules/util/CaseConversor';

describe( 'CaseConversor', () => {

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