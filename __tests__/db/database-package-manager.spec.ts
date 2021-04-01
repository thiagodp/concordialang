import { fs, vol } from 'memfs';
import * as path from 'path';
import { promisify } from 'util';

import { allInstalledDatabases, databasePackageNameFor } from '../../modules/db/database-package-manager';
import { FSDirSearcher } from '../../modules/util/fs/FSDirSearcher';

describe( 'database-package-manager', () => {

    const currentDir: string = path.normalize( process.cwd() );
	const localModulesDir: string = path.join( currentDir, 'node_modules' );

    // beforeEach( () => {
    //     vol.mkdirpSync( currentDir, { recursive: true } as any ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
    //     vol.mkdirpSync( localModulesDir );
    // } );

    afterEach( () => {
        vol.reset(); // erase in-memory structure
    } );

	it( 'finds it correctly', async () => {

        vol.mkdirpSync( currentDir, { recursive: true } as any ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        vol.mkdirpSync( localModulesDir );

		vol.mkdirpSync( path.join( localModulesDir, 'database-js' ) );
		vol.mkdirpSync( path.join( localModulesDir, 'database-js-json' ) );

		const s = new FSDirSearcher( fs, promisify );
		const r = await allInstalledDatabases( localModulesDir, s );

		expect( r.length ).toEqual( 1 );
		expect( r[ 0 ] ).toEqual( 'json' );
	} );

	it( 'completes a database name with the package name', () => {
		expect( databasePackageNameFor( 'mysql' ) )
			.toEqual( 'database-js-mysql' );
	} );

	it( 'keeps a correct package name', () => {
		expect( databasePackageNameFor( 'database-js-mysql' ) )
			.toEqual( 'database-js-mysql' );
	} );

} );
