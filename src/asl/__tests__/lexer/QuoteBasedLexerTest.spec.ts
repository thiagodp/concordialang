import { Keywords } from '../../modules/req/Keywords';
import { QuotedNodeLexer } from "../../modules/req/lexer/QuotedNodeLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'QuoteBasedLexerTest', () => {

    let keyword = 'import';
    let wordInsensitive = 'ImPorT';
    let word = 'import';
    let words = [ word ];    
    
    let lexer = new QuotedNodeLexer( words, keyword );

    it( 'detects the content in a line', () => {
        let line = word + ' "Hello world"';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
    } );

    it( 'detects the content ignoring its case', () => {
        let line = wordInsensitive + ' "Hello world"';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
    } );    

    it( 'detects the content in a line with spaces and tabs', () => {
        let line = "  \t  \t " + word + ' "Hello world"';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
    } );    

    it( 'does not detect an inexistent keyword in a line', () => {
        let line = 'Someelse "Hello world"';
        expect( lexer.analyze( line ) ).toBeNull()
    } );
    
    it( 'does not detect the content when its word is not the first one', () => {
        let line = 'Not the ' + word + ' "Hello world"';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'does not detect the content when its word is not surrounded by quotes', () => {
        let line = word + ' Hello world';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'does not detect the content not followed by its separator', () => {
        let line = word + ' ' + word + ' "Hello world"';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'detects the content in the correct position', () => {
        let line = word + ' "Hello world"';

        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                keyword: keyword,
                content: "Hello world",
                location: { line: 1, column: 1 }
            }
        );
    } );

    it( 'detects the content in the correct position even with additional spaces or tabs', () => {
        let line = "  \t \t" + word + " \t " + '"Hello world"';
        
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                keyword: keyword,
                content: "Hello world",
                location: { line: 1, column: 6 }
            }
        );
    } );

    it( 'detects a invalid name but registers an error', () => {
        let line = word + ' "1nv4lid n4me" ';
        let r = lexer.analyze( line, 1 );
        let node = r.nodes[ 1 ];

        expect( node ).toEqual(
            {
                keyword: keyword,
                location: { line: 1, column: 1 },
                content: "1nv4lid n4me"
            }
        );

        expect( r.errors ).toHaveLength( 1 );

        let e = r.errors[ 0 ];
        expect( e.location.column ).toBe( word.length + ' "'.length + 1 );
    } );



    // INVALID NAMES

    it( 'considers invalid name - empty name', () => {
        expect( lexer.isValidName( '' ) ).toBeFalsy();
    } );

    it( 'considers invalid name - space only', () => {
        expect( lexer.isValidName( '' ) ).toBeFalsy();
    } );

    it( 'considers invalid name - number only', () => {
        expect( lexer.isValidName( '4' ) ).toBeFalsy();
    } );

    it( 'considers invalid name - underline only', () => {
        expect( lexer.isValidName( '_' ) ).toBeFalsy();
    } );

    it( 'considers invalid name - dash only', () => {
        expect( lexer.isValidName( '-' ) ).toBeFalsy();
    } );

    it( 'considers invalid name - dot only', () => {
        expect( lexer.isValidName( '.' ) ).toBeFalsy();
    } );

    it( 'considers invalid name - quotes', () => {
        expect( lexer.isValidName( '"any"' ) ).toBeFalsy();
    } );

    it( 'considers invalid name - apostrophe', () => {
        expect( lexer.isValidName( "'any'" ) ).toBeFalsy();
    } );    

    // VALID NAMES

    it( 'considers valid name - single letter', () => {
        expect( lexer.isValidName( 'A' ) ).toBeTruthy();
        expect( lexer.isValidName( 'a' ) ).toBeTruthy();
    } );

    it( 'considers valid name - accented letter', () => {
        expect( lexer.isValidName( 'Á' ) ).toBeTruthy();
        expect( lexer.isValidName( 'á' ) ).toBeTruthy();
        expect( lexer.isValidName( 'ü' ) ).toBeTruthy();
    } );    

    it( 'considers valid name - number after letter', () => {
        expect( lexer.isValidName( 'A4' ) ).toBeTruthy();
    } );

    it( 'considers valid name - space after letter', () => {
        expect( lexer.isValidName( 'A ' ) ).toBeTruthy();
    } );

    it( 'considers valid name - underline after letter', () => {
        expect( lexer.isValidName( 'A_' ) ).toBeTruthy();
    } );

    it( 'considers valid - underline after letter', () => {
        expect( lexer.isValidName( 'A_' ) ).toBeTruthy();
    } );

    it( 'considers valid name - dash after letter', () => {
        expect( lexer.isValidName( 'A-' ) ).toBeTruthy();
    } );

    it( 'considers valid name - dot after letter', () => {
        expect( lexer.isValidName( 'A.' ) ).toBeTruthy();
    } );

    it( 'considers valid name - common names', () => {
        expect( lexer.isValidName( 'Some valid name' ) ).toBeTruthy();
        expect( lexer.isValidName( 'Some-name 100 _val.' ) ).toBeTruthy();
    } );        

} );