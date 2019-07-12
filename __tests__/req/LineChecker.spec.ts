import { LineChecker } from "../../modules/req/LineChecker";

describe( 'LineChecker', () => {

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

    // countLeftSpacesAndTabs

    it( 'count left spaces or tabs correctly', () => {
        expect( checker.countLeftSpacesAndTabs( "  hi" ) ).toBe( 2 );
        expect( checker.countLeftSpacesAndTabs( "hi" ) ).toBe( 0 );
        expect( checker.countLeftSpacesAndTabs( "\t  \thi" ) ).toBe( 4 );
    } );

    // caseInsensitivePositionOf

    it( 'detects text starting with some value', () => {
        expect( checker.caseInsensitivePositionOf( 'hello', 'hello world' ) ).toBe( 0 );
    } );

    it( 'detects text starting with some value after spaces and tabs', () => {
        expect( checker.caseInsensitivePositionOf( 'hello', '  \t \t\t hello world' ) ).toBe( 7 );
    } );

    it( 'detects text starting with some value in a case insensitive way', () => {
        expect( checker.caseInsensitivePositionOf( 'hello', '  \t \t\t HeLlo world' ) ).toBe( 7 );
        expect( checker.caseInsensitivePositionOf( 'hello', '  \t \t\t hEllO world' ) ).toBe( 7 );
        expect( checker.caseInsensitivePositionOf( 'hi', '  \t \t\t hEllO world' ) ).toBe( -1 );
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