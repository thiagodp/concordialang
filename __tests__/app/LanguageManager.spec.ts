import { resolve } from 'path';

import { LanguageManager } from "../../modules/app/LanguageManager";
import { Options } from "../../modules/app/Options";

describe( 'LanguageManager', () => {

    const langDir: string = new Options( resolve( process.cwd(), 'dist/' ) ).languageDir;

    it( 'detects files correctly', async () => {
        const m = new LanguageManager( langDir );
        const files: string[] = await m.languageFiles();
        expect( files ).toContain( 'pt.json' );
    } );

    it( 'detects available correctly', async () => {
        const m = new LanguageManager( langDir );
        const languages: string[] = await m.availableLanguages();
        expect( languages ).toContain( 'en' );
    } );

} );