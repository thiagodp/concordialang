import { QueryReferenceReplacer } from "../../modules/util/QueryReferenceReplacer";

describe( 'QueryReferenceReplacer', () => {

	let replacer: QueryReferenceReplacer;

	beforeAll( () => {
		replacer = new QueryReferenceReplacer();
	} );

	afterAll( () => {
		replacer = null;
	} );

	describe( '#replaceUIElementInQuery', () => {

		it( 'replaces a string', () => {
			const r = replacer.replaceUIElementInQuery(
				'SELECT * FROM T WHERE f = {Foo}',
				'Foo',
				'Hello'
			);
			expect( r ).toEqual( `SELECT * FROM T WHERE f = 'Hello'` );
		} );

		it( 'replaces a number', () => {
			const r = replacer.replaceUIElementInQuery(
				'SELECT * FROM T WHERE f = {Foo}',
				'Foo',
				0
			);
			expect( r ).toEqual( `SELECT * FROM T WHERE f = 0` );
		} );

		it( 'replaces a negative number', () => {
			const r = replacer.replaceUIElementInQuery(
				'SELECT * FROM T WHERE f = {Foo}',
				'Foo',
				-1
			);
			expect( r ).toEqual( `SELECT * FROM T WHERE f = -1` );
		} )

		it( 'replaces a boolean false', () => {
			const r = replacer.replaceUIElementInQuery(
				'SELECT * FROM T WHERE f = {Foo}',
				'Foo',
				false
			);
			expect( r ).toEqual( `SELECT * FROM T WHERE f = false` );
		} );

		it( 'replaces a boolean true', () => {
			const r = replacer.replaceUIElementInQuery(
				'SELECT * FROM T WHERE f = {Foo}',
				'Foo',
				true
			);
			expect( r ).toEqual( `SELECT * FROM T WHERE f = true` );
		} );

		it( 'avoids invalid SQL string', () => {
			const r = replacer.replaceUIElementInQuery(
				'SELECT * FROM T WHERE f = {Foo}',
				'Foo',
				`'''`
			);
			expect( r ).toEqual( `SELECT * FROM T WHERE f = '\\'\\'\\''` );
		} );

		it( 'prevents SQL injection', () => {
			const r = replacer.replaceUIElementInQuery(
				'SELECT * FROM T WHERE f = {Foo}',
				'Foo',
				`'; DROP TABLE T; -- `
			);
			expect( r ).toEqual( `SELECT * FROM T WHERE f = '\\'; DROP TABLE T; -- '` );
		} );

	} );

} );
