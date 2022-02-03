import { authorsAsStringArray, pluginDataFromPackage, PLUGIN_PROPERTY } from "../../modules/plugin/PluginData";

describe( 'PluginData', () => {

    describe( '#authorsAsStringArray', () => {

        it( 'converts undefined', () => {
            const author = undefined;
            const r = authorsAsStringArray( author );
            expect( r ).toEqual( [] );
        } );

        it( 'converts an object with name and email', () => {
            const author = {
                name: 'Bob',
                email: 'bob@bobsite.com',
            };
            const r = authorsAsStringArray( author );
            expect( r ).toEqual( [ author.name + ' <' + author.email + '>' ] );
        } );

        it( 'converts an object with name and url', () => {
            const author = {
                name: 'Bob',
                url: 'www.bobsite.com',
            };
            const r = authorsAsStringArray( author );
            expect( r ).toEqual( [ author.name + ' <' + author.url + '>' ] );
        } );

        it( 'converts an object with name, email and url', () => {
            const author = {
                name: 'Bob',
                email: 'bob@bobsite.com',
                url: 'www.bobsite.com',
            };
            const r = authorsAsStringArray( author );
            expect( r ).toEqual( [ author.name + ' <' + author.email + '>' ] );
        } );

        it( 'converts an author string', () => {
            const author = 'Bob <bob@bobsite.com>';
            const r = authorsAsStringArray( author );
            expect( r ).toEqual( [ author ] );
        } );

        it( 'converts an empty array', () => {
            const author = [];
            const r = authorsAsStringArray( author );
            expect( r ).toEqual( [] );
        } );

        it( 'converts an array of string', () => {
            const author = [ 'Bob', 'Alice' ];
            const r = authorsAsStringArray( author );
            expect( r ).toEqual( author );
        } );

        it( 'converts an array of object', () => {
            const author = [
                {
                    name: 'Bob',
                    email: 'bob@site1.com',
                    url: 'www.site1.com',
                },
                {
                    name: 'Alice',
                    email: 'alice@site2.com',
                    url: 'www.site2.com',
                },
            ];
            const r = authorsAsStringArray( author );
            expect( r ).toEqual( [ 'Bob <bob@site1.com>', 'Alice <alice@site2.com>' ] );
        } );

    } );



    describe( '#pluginDataFromPackage', () => {

        it( 'returns undefined when package does not have the needed property', () => {
            let pkg = {};
            const r = pluginDataFromPackage( pkg );
            expect( r ).toEqual( { authors: [], description: undefined, main: undefined, name: undefined, version: undefined } );
        } );

        it( 'returns plugin data with the needed properties', () => {

            let pkg = {
                name: 'concordialang-fake'
            };

            pkg[ PLUGIN_PROPERTY ] = true;

            const r = pluginDataFromPackage( pkg );
            expect( r ).not.toBeUndefined();
            expect( r ).toHaveProperty( 'name', 'concordialang-fake' );
        } );

    } );

} );