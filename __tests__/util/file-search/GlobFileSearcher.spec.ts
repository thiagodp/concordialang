import { fs, vol } from 'memfs';
import { join, normalize, resolve } from "path";
import { Options } from "../../../modules/app/Options";
import { GlobFileSearcher } from "../../../modules/util/file-search/GlobFileSearcher";

describe( 'GlobFileSearcher', () => {

    let s: GlobFileSearcher; // under test
    let o: Options;

    const dir = process.cwd();
    const currentDir: string = normalize( resolve( dir, 'dist/' ) );

    beforeEach( () => {
        s = new GlobFileSearcher( fs );
        o = new Options( currentDir, dir );
        o.directory = currentDir;

        // Create in-memory file structure

        vol.mkdirpSync( currentDir, { recursive: true } as any ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        vol.writeFileSync( join( currentDir, 'one.feature' ), '1f' );
        vol.writeFileSync( join( currentDir, 'one.testcase' ), '1t' );
        vol.writeFileSync( join( currentDir, 'two.feature' ), '2' );
        vol.writeFileSync( join( currentDir, 'readme.txt' ), 'readme!' );
        const sub = join( currentDir, 'sub/' );
        // console.log( 'Dir:', currentDir );
        // console.log( 'Sub:', sub );
        vol.mkdirpSync( sub );
        vol.writeFileSync( join( sub, 'three.feature' ), '3' );
        vol.writeFileSync( join( sub, 'four.feature' ), '4f' );
        vol.writeFileSync( join( sub, 'four.testcase' ), '4t' );
        vol.writeFileSync( join( sub, 'one.testcase' ), '1t' );
        vol.writeFileSync( join( sub, 'readme.md' ), '# readme' );
    } );

    afterEach( () => {
        s = null;
        o = null;
        vol.reset(); // erase in-memory structure
    } );

    it( 'extensions - current directory', async () => {
        o.recursive = false;
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 3 );
    } );

    it( 'extensions - any directory', async () => {
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 7 );
    } );

    it( 'single extension - any directory', async () => {
        o.extensions = [ '.txt' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 1 );
    } );

    it( 'single extension - current directory', async () => {
        o.extensions = [ '.txt' ];
        o.recursive = false;
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 1 );
    } );

    it( 'other extensions - any directory', async () => {
        o.extensions = [ '.txt', '.md' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 2 );
    } );

    it( 'file from the current directory - current directory', async () => {
        o.recursive = false;
        o.files = [ 'one.feature' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 1 );
    } );

    it( 'file from the current directory - any directory', async () => {
        o.recursive = true;
        o.files = [ 'one.feature' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 1 );
    } );

    it( 'file from a subdirectory - any directory', async () => {
        o.recursive = true;
        o.files = [ 'three.feature' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 1 );
    } );

    it( 'file from a subdirectory - current directory', async () => {
        o.recursive = false;
        o.files = [ 'three.feature' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 0 );
    } );

    it( 'ignore single file - current directory', async () => {
        o.recursive = false;
        o.ignore = [ 'one.testcase' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 2 );
    } );

    it( 'ignore files - current directory', async () => {
        o.recursive = false;
        o.ignore = [ 'one.feature', 'two.feature' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 1 );
    } );

    it( 'ignore single file - any directory', async () => {
        o.ignore = [ 'four.testcase' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 6 );
    } );

    it( 'ignore single file - subdirectory only', async () => {
        o.ignore = [ 'sub/four.testcase' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 6 );
    } );

    it( 'ignore repeated file - any directory', async () => {
        o.ignore = [ 'one.testcase' ];
        const result: string[] = await s.searchFrom( o );
        expect( result ).toHaveLength( 5 );
    } );


} );