import { fs, vol } from 'memfs';
import { join, resolve } from "path";
import { Options } from "../../modules/app/Options";
import { LanguageManager } from "../../modules/language/LanguageManager";
import { FSFileSearcher } from "../../modules/util/file/FSFileSearcher";

describe( 'LanguageManager', () => {

    let m: LanguageManager; // under test

    const fileSearcher = new FSFileSearcher( fs );
    const dir = resolve( process.cwd(), 'dist/' );
    const langDir: string = new Options( dir ).languageDir;

    beforeAll( () => {
        // Create in-memory file structure
        vol.mkdirpSync( dir, { recursive: true } as any ); // Synchronize - IMPORTANT! - mkdirpSync, not mkdirSync
        vol.mkdirpSync( langDir );
        vol.writeFileSync( join( langDir, 'pt.json' ), '{}' );
        vol.writeFileSync( join( langDir, 'en.json' ), '{}' );
        vol.writeFileSync( join( langDir, 'readme.txt' ), 'readme!' );
    } );

    afterAll( () => {
        vol.reset(); // erase in-memory structure
    } );


    beforeEach( () => {
        m = new LanguageManager( fileSearcher, langDir );
    } );

    afterEach( () => {
        m = null;
    } );

    it( 'detects files correctly', async () => {
        const files: string[] = await m.languageFiles();
        expect( files.find( f => f.endsWith( 'pt.json' ) ) ).toBeTruthy();
        expect( files.find( f => f.endsWith( 'en.json' ) ) ).toBeTruthy();
    } );

    it( 'detects available correctly', async () => {
        const languages: string[] = await m.availableLanguages();
        expect( languages ).toContain( 'en' );
    } );

} );