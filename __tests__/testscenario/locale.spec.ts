import { createDefaultLocaleMap, fallbackToLanguage, isLocaleAvailable, isLocaleFormatValid, LocaleMap } from "../../modules/testscenario/locale";

describe( 'locale', () => {

    describe( '#isLocaleFormatValid', () => {

        it( 'accepts language without country', () => {
            expect( isLocaleFormatValid( 'en' ) ).toBeTruthy();
        } );

        it( 'language must have at least two letters', () => {
            expect( isLocaleFormatValid( 'e' ) ).toBeFalsy();
        } );

        it( 'language must have at most two letters', () => {
            expect( isLocaleFormatValid( 'eng' ) ).toBeFalsy();
        } );

        it( 'does not accept language with number', () => {
            expect( isLocaleFormatValid( 'e1' ) ).toBeFalsy();
        } );

        it( 'accepts language and country', () => {
            expect( isLocaleFormatValid( 'en-US' ) ).toBeTruthy();
        } );

        it( 'country must have at least two letters', () => {
            expect( isLocaleFormatValid( 'en-U' ) ).toBeFalsy();
        } );

        it( 'country must have at most two letters', () => {
            expect( isLocaleFormatValid( 'en-UST' ) ).toBeFalsy();
        } );

        it( 'does not accept language with number', () => {
            expect( isLocaleFormatValid( 'en-US1' ) ).toBeFalsy();
        } );

        it( 'strict check only accepts language in lowercase', () => {
            expect( isLocaleFormatValid( 'en', true ) ).toBeTruthy();
            expect( isLocaleFormatValid( 'En', true ) ).toBeFalsy();
            expect( isLocaleFormatValid( 'eN', true ) ).toBeFalsy();
            expect( isLocaleFormatValid( 'EN', true ) ).toBeFalsy();
        } );

        it( 'strict check only accepts country in uppercase', () => {
            expect( isLocaleFormatValid( 'en-US', true ) ).toBeTruthy();
            expect( isLocaleFormatValid( 'en-Us', true ) ).toBeFalsy();
            expect( isLocaleFormatValid( 'en-uS', true ) ).toBeFalsy();
            expect( isLocaleFormatValid( 'en-us', true ) ).toBeFalsy();
        } );

    } );


    /**
     * @see https://github.com/date-fns/date-fns/tree/master/src/locale for available locales.
     * @see https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes for possible country codes.
     */
    describe( '#fallbackToLanguage', () => {

        let map: LocaleMap;

        beforeAll( () => {
            map = createDefaultLocaleMap();
        } );

        afterAll( () => {
            map = null;
        } );

        it( 'accepts pre-loaded language with country', async () => {
            const r = await fallbackToLanguage( 'en-US', map );
            expect( r ).toEqual( 'en-US' );
        } );

        it( 'accepts pre-loaded language without country', async () => {
            const r = await fallbackToLanguage( 'en', map );
            expect( r ).toEqual( 'en' );
        } );

        it( 'accepts an existing but not pre-loaded language with country', async () => {
            const r = await fallbackToLanguage( 'en-GB', map );
            expect( r ).toEqual( 'en' );

            const r2 = await fallbackToLanguage( 'fr', map );
            expect( r2 ).toEqual( 'fr' );
        } );

        it( 'a non existing country fallbacks to an existing language', async () => {
            const r = await fallbackToLanguage( 'es-AR', map );
            expect( r ).toEqual( 'es' );
        } );

        it( 'a non existing language and country returns null', async () => {
            const r = await fallbackToLanguage( 'xx-XX', map );
            expect( r ).toEqual( null );
        } );

        it( 'a non existing language returns null', async () => {
            const r = await fallbackToLanguage( 'xx', map );
            expect( r ).toEqual( null );
        } );

    } );


    describe( '#isLocaleAvailable', () => {

        let map: LocaleMap;

        beforeEach( () => {
            map = createDefaultLocaleMap();
        } );

        afterEach( () => {
            map = null;
        } );

        it ( 'is able to load an available language', async () => {
            expect( map.has( 'ja' ) ).toBeFalsy();
            expect( await isLocaleAvailable( 'ja', map ) ).toBeTruthy();
            expect( map.has( 'ja' ) ).toBeTruthy();
		} );

		it( 'rejects an invalid locale format', async () => {
			expect( await isLocaleAvailable( '1', map ) ).toBeFalsy();
		} );

    } );


} );
