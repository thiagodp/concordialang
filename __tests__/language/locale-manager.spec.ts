import { fs, vol } from 'memfs';
import * as path from 'path';
import { promisify } from 'util';

import { installedDateLocales } from '../../modules/language/locale-manager';
import { FSDirSearcher } from '../../modules/util/fs/FSDirSearcher';

describe( 'locale-manager', () => {

    const currentDir: string = path.normalize( process.cwd() );
	const localModulesDir: string = path.join( currentDir, 'node_modules' );
	const libraryDir = path.join( localModulesDir, 'date-fns' );
	const localeDir = path.join( libraryDir, 'locale' );

    beforeEach( () => {
        vol.mkdirpSync( currentDir, { recursive: true } as any ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
		vol.mkdirpSync( localModulesDir );
		vol.mkdirpSync( libraryDir );
		vol.mkdirpSync( localeDir );
    } );

    afterEach( () => {
        vol.reset(); // erase in-memory structure
    } );

	it( 'finds locales correctly', async () => {

		const enUS = 'en-US';
		const ptBR = 'pt-BR';
		vol.mkdirpSync( path.join( localeDir, enUS ) );
		vol.mkdirpSync( path.join( localeDir, ptBR ) );

		const s = new FSDirSearcher( fs, promisify );
		const r = await installedDateLocales( localModulesDir, s, path );

		expect( r.length ).toEqual( 2 );
		expect( r ).toEqual( [ enUS, ptBR ] );
	} );

} );
