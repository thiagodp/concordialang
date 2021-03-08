import { OneWiseStrategy } from "../../modules/selection/CombinationStrategy";

describe( 'CombinationStrategy', () => {

	it( 'OneWiseStrategy', () => {

		const obj = {
			"a": [ 1, 2, 3 ],
			"b": [ "A", "B" ]
		};

		const s = new OneWiseStrategy( "seed-example" );
		const r = s.combine( obj );

		expect( r ).toEqual( [
			{ "a": 1, "b": "A" },
			{ "a": 2, "b": "B" },
			{ "a": 3, "b": "A" },
		] );
	} );

} );
