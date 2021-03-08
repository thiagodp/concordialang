import { sortedMatches, bestMatch } from '../../modules/util/best-match';

describe( 'best-match', () => {

	describe( 'sortedMatches', () => {

		it.each( [
			[ undefined, [ 'a' ], ( a, b ) => 1 ],
			[ 'a', undefined, ( a, b ) => 1 ],
			[ 'a', [ 'a' ], undefined ],
		] )( 'returns an empty array when something is undefined',
			( t, v, f ) => {
			expect( sortedMatches( t, v, f ) ).toEqual( [] );
		} );

		it( 'sorts matches by rating descending', () => {
			expect( sortedMatches(
				'a', [ 'a', 'b' ], ( a, b ) => a == b ? 1: 0
			 ) ).toEqual( [
				 { value: 'a', index: 0, rating: 1 },
				 { value: 'b', index: 1, rating: 0 },
			 ] );
		} );

	} );


	describe( 'bestMatch', () => {

		it.each( [
			[ undefined, [ 'a' ], ( a, b ) => 1 ],
			[ 'a', undefined, ( a, b ) => 1 ],
			[ 'a', [ 'a' ], undefined ],
		] )( 'returns null when something is undefined',
			( t, v, f ) => {
			expect( bestMatch( t, v, f ) ).toEqual( null );
		} );

		it( 'returns the best match', () => {
			expect( bestMatch(
				'a', [ 'a', 'b' ], ( a, b ) => a == b ? 1: 0
			 ) ).toEqual(
				 { value: 'a', index: 0, rating: 1 }
			 );
		} );

	} );

} );
