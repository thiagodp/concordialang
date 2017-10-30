import { CodeceptJSOptionsBuilder } from '../../../plugins/codeceptjs/CodeceptJSOptionsBuilder';

/**
 * @author Matheus Eller Fagundes
 */
describe( 'CodeceptJSOptionsBuilderTest', () => {

    it( 'builds default options', () => {
        const defaultOptions: object = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js"
        };

        const options = new CodeceptJSOptionsBuilder().value();

        expect( options ).toEqual( defaultOptions );
    } );

    it( 'builds options with custom driver', () => {
        const expectedOptions: object = {
            helpers: {
                SomeDriver: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js"
        };

        const options = new CodeceptJSOptionsBuilder()
            .withDriver( 'SomeDriver' )
            .value();

        expect( options ).toEqual( expectedOptions );
    } );

    it( 'builds options with custom browser', () => {
        const expectedOptions: object = {
            helpers: {
                WebDriverIO: {
                    browser: "firefox",
                    url: "http://localhost:8080"
                }
            },
            tests: "*.js"
        };

        const options = new CodeceptJSOptionsBuilder()
            .withBrowser( 'firefox' )
            .value();

        expect( options ).toEqual( expectedOptions );
    } );

    it( 'builds options with custom url', () => {
        const expectedOptions: object = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "https://www.mywebsystem.com/"
                }
            },
            tests: "*.js"
        };

        const options = new CodeceptJSOptionsBuilder()
            .withUrl( 'https://www.mywebsystem.com/' )
            .value();

        expect( options ).toEqual( expectedOptions );
    } );

    it( 'builds options with custom filter', () => {
        const expectedOptions: object = {
            helpers: {
                WebDriverIO: {
                    browser: "chrome",
                    url: "http://localhost:8080"
                }
            },
            tests: "*_test.js"
        };

        const options = new CodeceptJSOptionsBuilder()
            .withFilter( '*_test.js' )
            .value();

        expect( options ).toEqual( expectedOptions );
    } );

    it( 'builds full customized options', () => {
        const expectedOptions: object = {
            helpers: {
                SomeDriver: {
                    browser: "firefox",
                    url: "https://www.mywebsystem.com/"
                }
            },
            tests: "*_test.js"
        };

        const options = new CodeceptJSOptionsBuilder()
            .withDriver( 'SomeDriver' )
            .withBrowser( 'firefox' )
            .withFilter( '*_test.js' )
            .withUrl( 'https://www.mywebsystem.com/' )
            .value();

        expect( options ).toEqual( expectedOptions );
    } );
    
} );
