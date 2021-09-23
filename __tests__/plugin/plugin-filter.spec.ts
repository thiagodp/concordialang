import { areNamesConsideredEqual, arePluginNamesEqual, filterPluginsByName, removeVersionFromPackageName } from '../../modules/plugin/plugin-filter';
import { NewOrOldPluginData, PluginData } from '../../modules/plugin/PluginData';

describe( 'plugin-filter', () => {

	const prefix = 'x-';

	describe( '#areNamesConsideredEqual', () => {
		it.each( [
			[ 'a', 'b', false ],
			[ 'a', 'a', true ],
			[ 'A', 'A', true ],
			[ 'A', 'a', true ],
			[ 'a', 'A', true ],
			[ prefix + 'a', 'a', true ],
			[ 'a', prefix + 'a', true ],
			[ prefix + 'a', prefix + 'a', true ],

		] )( 'with "%s" and "%s" should return %s', ( from: string, to: string, expected: boolean ) => {
			const r = areNamesConsideredEqual( from, to, prefix );
			expect( r ).toEqual( expected );
		} );

	} );

	describe( '#removeVersionFromPackageName', () => {
		it.each( [
			[ 'a', 'a' ],
			[ 'a@', 'a' ],
			[ 'a@1', 'a' ],

		] )( '%s should return %s', ( name: string, expected: string ) => {
			const r = removeVersionFromPackageName( name );
			expect( r ).toEqual( expected );
		} );
	} );


	describe( '#compareNames', () => {

		describe.each( [
			[ false ],
			[ true ]
		] )( 'partial comparison: %s', ( partialComparison: boolean ) => {

			it.each( [
				// Without prefix, with version
				[ 'a', 'a', true ],
				[ 'a@', 'a', true ],
				[ 'a@1', 'a', true ],
				[ 'a', 'a@', true ],
				[ 'a@', 'a@1', true ],
				[ 'a@1', 'a',true ],

				// With prefix
				[ prefix + 'a', 'a', true ],
				[ 'a', prefix + 'a', true ],
				[ prefix + 'a', prefix + 'a', true ],

				// With prefix and version
				[ prefix + 'a', 'a@1', true ],
				[ 'a@1', prefix + 'a', true ],

			] )( '"%s" and "%s" should return %s', ( from: string, to: string, expected: boolean ) => {
				const r = arePluginNamesEqual( from, to, partialComparison, prefix );
				expect( r ).toEqual( expected );
			} );

		} );

		it.each( [
			[ 'a', 'aa', true ],
			[ 'aa', 'a', true ],
			[ 'b', 'ac', false ],
		] )( '"%s", "%s" -> %s', ( from: string, to: string, expected: boolean ) => {
			const r = arePluginNamesEqual( from, to, true, prefix );
			expect( r ).toEqual( expected );
		} );

	} );


	describe( '#filterPluginsByName', () => {

		const pluginNamed = ( name: string ): PluginData => ( { name, description: '', version: '', authors: [], main: '' } as PluginData );

		it( 'should not find anything when the given name is not in the list', () => {
			const plugins: NewOrOldPluginData[] = [ pluginNamed( 'aa' ), pluginNamed( 'bb' ) ];
			const r = filterPluginsByName( plugins, 'cc' );
			expect( r ).toHaveLength( 0 );
		} );

		it( 'should find with an existing name', () => {
			const p: PluginData = pluginNamed( 'aa' );
			const plugins: NewOrOldPluginData[] = [ p, pluginNamed( 'bb' ) ];
			const r = filterPluginsByName( plugins, p.name );
			expect( r ).toEqual( [ p ] );
		} );

		it( 'should find by a partial name', () => {
			const p: PluginData = pluginNamed( 'aa' );
			const plugins: NewOrOldPluginData[] = [ p, pluginNamed( 'bb' ) ];
			const r = filterPluginsByName( plugins, 'a', true );
			expect( r ).toEqual( [ p ] );
		} );

		it( 'should find without giving an existing prefix', () => {
			const p: PluginData = pluginNamed( prefix + 'aa' );
			const plugins: NewOrOldPluginData[] = [ p, pluginNamed( 'bb' ) ];
			const r = filterPluginsByName( plugins, 'aa', false, prefix );
			expect( r ).toEqual( [ p ] );
		} );

		it( 'should find by a partial name without giving an existing prefix', () => {
			const p: PluginData = pluginNamed( prefix + 'aa' );
			const plugins: NewOrOldPluginData[] = [ p, pluginNamed( 'bb' ) ];
			const r = filterPluginsByName( plugins, 'a', true, prefix );
			expect( r ).toEqual( [ p ] );
		} );

	} );


} );
