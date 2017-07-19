import { LineChecker } from "../../modules/extractor/LineChecker"

describe( 'LineChecker Test', () => {

    let checker: LineChecker = new LineChecker();
    let separator = ':';

    // isEmpty

    it( 'detects lines with spaces as empty lines', () => {
        expect( checker.isEmpty( '  ' ) ).toBeTruthy();
    } );

    it( 'detects lines with tabs as empty lines', () => {
        expect( checker.isEmpty( "\t\t" ) ).toBeTruthy();
    } );

    it( 'detects lines with line ends as empty lines', () => {
        expect( checker.isEmpty( "\n\n" ) ).toBeTruthy();
    } );

    it( 'detects lines with spaces, tabs, and line ends as empty lines', () => {
        expect( checker.isEmpty( "\t  \t  \n\n" ) ).toBeTruthy();
    } );

    // startsWith

    it( 'detects text starting with some value', () => {
        expect( checker.startsWith( 'hello', 'hello world' ) ).toBeTruthy();
    } );

    it( 'detects text starting with some value after spaces and tabs', () => {
        expect( checker.startsWith( 'hello', '  \t \t\t hello world' ) ).toBeTruthy();
    } );

    it( 'detects text starting with some value in a case insensitive way', () => {
        expect( checker.startsWith( 'hello', '  \t \t\t HeLlo world' ) ).toBeTruthy();
        expect( checker.startsWith( 'hello', '  \t \t\t hEllO world' ) ).toBeTruthy();
        expect( checker.startsWith( 'hi', '  \t \t\t hEllO world' ) ).toBeFalsy();
    } );

    // textAfterSeparator

    it( 'retrieves any text after colon', () => {
        expect( checker.textAfterSeparator( separator, 'Hello: Word' ) ).toBe( ' Word' );
        expect( checker.textAfterSeparator( separator, 'Hello:: Word' ) ).toBe( ': Word' );
        expect( checker.textAfterSeparator( separator, 'Hello: Word : !' ) ).toBe( ' Word : !' );
    } );

    it( 'retrieves an empty string when does not have colon', () => {
        expect( checker.textAfterSeparator( separator, 'Hello Word' ) ).toBe( '' );
    } );

} );