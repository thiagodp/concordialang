import { fs, vol } from 'memfs';
import { join, normalize, resolve } from "path";
import { Options } from "../../../modules/app/Options";
import { FileSearcher } from '../../../modules/util/file/FileSearcher';
import { FSFileSearcher } from "../../../modules/util/file/FSFileSearcher";

describe( 'FileSearcher', () => {

    let s: FileSearcher; // under test
    let o: Options;

    const dir = process.cwd();
    const currentDir: string = normalize( resolve( dir, 'dist/' ) );
    const subDir = join( currentDir, 'sub/' );
    // console.log( 'Dir:', currentDir );
    // console.log( 'Sub:', sub );

    beforeAll( () => {
        // Create in-memory file structure
        vol.mkdirpSync( currentDir, { recursive: true } as any ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        vol.writeFileSync( join( currentDir, 'one.feature' ), '1f' );
        vol.writeFileSync( join( currentDir, 'one.testcase' ), '1t' );
        vol.writeFileSync( join( currentDir, 'two.feature' ), '2' );
        vol.writeFileSync( join( currentDir, 'readme.txt' ), 'readme!' );

        vol.mkdirpSync( subDir );
        vol.writeFileSync( join( subDir, 'three.feature' ), '3' );
        vol.writeFileSync( join( subDir, 'four.feature' ), '4f' );
        vol.writeFileSync( join( subDir, 'four.testcase' ), '4t' );
        vol.writeFileSync( join( subDir, 'one.testcase' ), '1t' );
        vol.writeFileSync( join( subDir, 'readme.md' ), '# readme' );
    } );

    afterAll( () => {
        vol.reset(); // erase in-memory structure
    } );

    beforeEach( () => {
        s = new FSFileSearcher( fs );
        o = new Options( currentDir, dir );
        o.directory = currentDir;
    } );

    afterEach( () => {
        s = null;
        o = null;
    } );

    describe( 'extensions', () => {

        it( 'default extensions, not recursive', async () => {
            o.recursive = false;
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 3 );
        } );

        it( 'default extensions, recursive', async () => {
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 7 );
        } );

        it( 'default extensions, subdirectory only', async () => {
            o.directory = subDir;
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 4 );
        } );


        it( 'default extensions, recursive, one directory up', async () => {
            o.directory = resolve( currentDir, '../' );
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 7 );
        } );

        it( 'default extensions, recursive, two directories up', async () => {
            o.directory = resolve( currentDir, '../../' );
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 7 );
        } );

        it( 'default extensions, not recursive, two directories up', async () => {
            o.directory = resolve( currentDir, '../../' );
            o.recursive = false;
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 0 );
        } );

        it( 'single extension, subdirectory only', async () => {
            o.directory = subDir;
            o.extensions = [ '.feature' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 2 );
        } );

        it( 'single extension, recursive', async () => {
            o.extensions = [ '.txt' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 1 );
        } );

        it( 'single extension, not recursive', async () => {
            o.extensions = [ '.txt' ];
            o.recursive = false;
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 1 );
        } );

        it( 'other extensions, recursive', async () => {
            o.extensions = [ '.txt', '.md' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 2 );
        } );

    } );


    describe( 'restricts files', () => {

        it( 'single file, current directory', async () => {
            o.recursive = false;
            o.files = [ 'one.feature' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 1 );
        } );

        it( 'single file, with dot notation, current directory', async () => {
            o.files = [ './one.testcase' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 1 );
            expect( result[ 0 ] ).toContain( 'one.testcase' );
        } );

        it( 'single file, subdirectory', async () => {
            o.files = [ 'sub/three.feature' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 1 );
            expect( result[ 0 ] ).toContain( 'three.feature' );
        } );

        it( 'single file, dot notation, subdirectory', async () => {
            o.files = [ './sub/three.feature' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 1 );
            expect( result[ 0 ] ).toContain( 'three.feature' );
        } );

        it( 'does not find a file from a subdirectory in the current directory', async () => {
            o.recursive = false;
            o.files = [ 'three.feature' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 0 );
        } );

    } );

    describe( 'ignores', () => {

        it( 'single file, not recursive', async () => {
            o.recursive = false;
            o.ignore = [ 'one.testcase' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 2 );
        } );

        it( 'more than one file, not recursive', async () => {
            o.recursive = false;
            o.ignore = [ 'one.feature', 'two.feature' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 1 );
        } );

        it( 'single file, subdirectory only', async () => {
            o.ignore = [ 'sub/four.testcase' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 6 );
        } );

        it( 'more than one file, subdirectory only', async () => {
            o.ignore = [ 'sub/four.testcase', 'sub/one.testcase' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 5 );
        } );

        it( 'more than one file, current directory and subdirectory', async () => {
            o.ignore = [ 'one.testcase', 'sub/one.testcase' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 5 );
        } );

        it( 'does not appear in the returned list', async () => {
            o.files = [ './one.testcase', 'two.testcase' ];
            o.ignore = [ 'two.testcase' ];
            const result: string[] = await s.searchFrom( o );
            expect( result ).toHaveLength( 1 );
            expect( result[ 0 ] ).toContain( 'one.testcase' );
        } );

    } );

} );