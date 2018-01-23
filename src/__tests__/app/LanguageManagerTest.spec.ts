import { LanguageManager } from "../../modules/app/LanguageManager";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'LanguageManagerTest', () => {

    it( 'detects files correctly', async () => {
        const m = new LanguageManager();
        const files: string[] = await m.languageFiles();
        expect( files ).toContain( 'pt.json' );
    } );    

    it( 'detects available correctly', async () => {
        const m = new LanguageManager();
        const languages: string[] = await m.availableLanguages();
        expect( languages ).toContain( 'en' );
    } );

} );