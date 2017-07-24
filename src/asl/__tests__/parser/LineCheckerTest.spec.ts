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
        expect( checker.caseInsentiveStartsWith( 'hello', 'hello world' ) ).toBeTruthy();
    } );

    it( 'detects text starting with some value after spaces and tabs', () => {
        expect( checker.caseInsentiveStartsWith( 'hello', '  \t \t\t hello world' ) ).toBeTruthy();
    } );

    it( 'detects text starting with some value in a case insensitive way', () => {
        expect( checker.caseInsentiveStartsWith( 'hello', '  \t \t\t HeLlo world' ) ).toBeTruthy();
        expect( checker.caseInsentiveStartsWith( 'hello', '  \t \t\t hEllO world' ) ).toBeTruthy();
        expect( checker.caseInsentiveStartsWith( 'hi', '  \t \t\t hEllO world' ) ).toBeFalsy();
    } );

    // textAfterSeparator

    it( 'retrieves any text after the separator', () => {
        expect( checker.textAfterSeparator( separator, 'Hello: Word' ) ).toBe( ' Word' );
        expect( checker.textAfterSeparator( separator, 'Hello:: Word' ) ).toBe( ': Word' );
        expect( checker.textAfterSeparator( separator, 'Hello: Word : !' ) ).toBe( ' Word : !' );
    } );

    it( 'retrieves an empty string when does not have the separator', () => {
        expect( checker.textAfterSeparator( separator, 'Hello Word' ) ).toBe( '' );
    } );

    // textBeforeSeparator

    it( 'retrieves any text before the separator', () => {
        expect( checker.textBeforeSeparator( separator, 'Hello : Word' ) ).toBe( 'Hello ' );
        expect( checker.textBeforeSeparator( separator, 'One:: Two' ) ).toBe( 'One' );
        expect( checker.textBeforeSeparator( separator, '! Three : Four : !' ) ).toBe( '! Three ' );
    } );

    it( 'retrieves an empty string when does not have the separator', () => {
        expect( checker.textBeforeSeparator( separator, 'Hello Word' ) ).toBe( '' );
    } );    

} );