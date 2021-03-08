import { sortErrorsByLocation } from "../../modules/error/ErrorSorting";
import { RuntimeException } from "../../modules/error/RuntimeException";
import { Warning } from "../../modules/error/Warning";

describe( 'ErrorSorting', () => {

	it( 'sort by lines', () => {

		const [ e1, e2 ] = [
			new RuntimeException( 'foo', { line: 2, column: 2 } ),
			new RuntimeException( 'bar', { line: 1, column: 2 } ),
		];

		const r = sortErrorsByLocation( [ e1, e2 ] );

		expect( r ).toEqual( [ e2, e1 ] );
	} );

	it( 'sort by column when the lines are equal', () => {

		const [ e1, e2 ] = [
			new RuntimeException( 'foo', { line: 1, column: 4 } ),
			new RuntimeException( 'bar', { line: 1, column: 2 } ),
		];

		const r = sortErrorsByLocation( [ e1, e2 ] );

		expect( r ).toEqual( [ e2, e1 ] );
	} );

	it( 'warnings should appear after errors when there are no locations', () => {

		const [ w1, e, w2 ] = [
			new Warning( 'w1' ),
			new RuntimeException( 'e' ),
			new Warning( 'w2' ),
		];

		const r = sortErrorsByLocation( [ w1, e, w2 ] );

		expect( r ).toEqual( [ e, w1, w2 ] );
	} );

	it( 'should keep location order when they are defined', () => {

		const [ w1, e, w2 ] = [
			new Warning( 'w1', { line: 1, column: 1 } ),
			new RuntimeException( 'e', { line: 2, column: 1 } ),
			new Warning( 'w2', { line: 3, column: 1 } ),
		];

		const r = sortErrorsByLocation( [ w1, e, w2 ] );

		expect( r ).toEqual( [ w1, e, w2 ] );
	} );

} );
