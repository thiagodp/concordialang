import { joinDatabasePackageNames, makeDatabasePackageNameFor } from '../../modules/util/package-installation';

describe( 'package-installation', () => {

	it( 'completes a database name with the package name', () => {
		expect( makeDatabasePackageNameFor( 'mysql' ) ).toEqual( 'database-js-mysql' );
	} );

	it( 'keeps a correct package name', () => {
		expect( makeDatabasePackageNameFor( 'database-js-mysql' ) ).toEqual( 'database-js-mysql' );
	} );

	it( 'joins multiple package names', () => {
		const names = [ 'mysql', 'database-js-json', 'ini' ];
		expect( joinDatabasePackageNames( names ) )
			.toEqual( 'database-js-mysql database-js-json database-js-ini' );
	} );

} );