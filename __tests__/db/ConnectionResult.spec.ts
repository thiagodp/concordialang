import { ConnectionCheckResult, ConnectionResult } from "../../modules/dbi/ConnectionResult";

describe( 'ConnectionResult', () => {

	describe( 'ConnectionCheckResult', () => {

		it( 'can filter succeeded results', () => {

			const [ foo, bar, zoo ] = [
				{ success: true } as ConnectionResult,
				{ success: false } as ConnectionResult,
				{ success: true } as ConnectionResult,
			];

			const map = {
				'foo': foo,
				'bar': bar,
				'zoo': zoo,
			};

			const c = new ConnectionCheckResult( false, map );
			const r = c.succeededResults();
			expect( r ).toEqual( [ foo, zoo ] );
		} );

	} );

} );
