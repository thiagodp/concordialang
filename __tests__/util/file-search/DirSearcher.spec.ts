import { fs, vol } from 'memfs';
import { join, normalize, resolve } from "path";
import { DirSearcher, DirSearchOptions } from '../../../modules/util/file/DirSearcher';
import { FSDirSearcher } from "../../../modules/util/file/FSDirSearcher";

describe( 'DirSearcher', () => {

    let s: DirSearcher; // under test
    let o: DirSearchOptions;

    const dir = process.cwd();
    const currentDir: string = normalize( resolve( dir, 'dist/' ) );
    const subDir1 = join( currentDir, 'sub/' );
    const subDir2 = join( currentDir, 'concordia' );
    const subDir3 = join( currentDir, 'concordia-bar' );
    const subDir4 = join( currentDir, 'concordia-foo' );
    const subDir5 = join( currentDir, 'x' );
    const subDir5Sub1 = join( subDir5, 'concordia-zoo' );
    const subDir5Sub2 = join( subDir5, 'zoo' );
    const subDir6 = join( currentDir, 'x-concordia' );
    const subDir7 = join( currentDir, 'zconcordia' );

    beforeAll( () => {
        // Create in-memory file structure
        vol.mkdirpSync( currentDir, { recursive: true } as any ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        vol.writeFileSync( join( currentDir, 'readme.txt' ), 'readme!' );
        vol.mkdirpSync( subDir1 );
        vol.mkdirpSync( subDir2 );
        vol.mkdirpSync( subDir3 );
        vol.mkdirpSync( subDir4 );
        vol.mkdirpSync( subDir5 );
        vol.mkdirpSync( subDir5Sub1 );
        vol.mkdirpSync( subDir5Sub2 );
        vol.mkdirpSync( subDir6 );
        vol.mkdirpSync( subDir7 );
    } );

    afterAll( () => {
        vol.reset(); // erase in-memory structure
    } );

    beforeEach( () => {
        s = new FSDirSearcher( fs );
        o = {
            directory: currentDir,
            recursive: false,
            regexp: /^concordia-.*$/
        };
    } );

    afterEach( () => {
        s = null;
        o = null;
    } );

    it( 'finds directories that match the regexp', async () => {
        const r = await s.search( o );
        expect( r ).toHaveLength( 2 );
        expect( r[ 0 ].endsWith( 'concordia-bar' ) ).toBeTruthy();
        expect( r[ 1 ].endsWith( 'concordia-foo' ) ).toBeTruthy();
    } );

    it( 'finds directories that match the regexp, recursive', async () => {
        o.recursive = true;
        const r = await s.search( o );
        expect( r ).toHaveLength( 3 );
    } );

} );