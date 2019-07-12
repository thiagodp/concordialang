import { NamedNodeLexer } from '../../modules/lexer/NamedNodeLexer';

describe( 'NamedNodeLexer', () => {

    let keyword = 'feature';
    let wordInsensitive = 'FeAtURe';
    let word = 'feature';
    let words = [ word ];

    let lexer = new NamedNodeLexer( words, keyword ); // under test

    it( 'detects the name in a line', () => {
        let line = word + ': Hello world';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
    } );

    it( 'detects the name ignoring its case', () => {
        let line = wordInsensitive + ': Hello world';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
    } );

    it( 'detects the name in a line with spaces and tabs', () => {
        let line = "  \t  \t " + word + ": Hello world";
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
    } );

    it( 'ignores a comment', () => {
        let line = word + ': Hello world# some comment here';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "Hello world"
            }
        );
    } );

    it( 'does not detect an inexistent name in a line', () => {
        let line = 'Someelse: Hello world';
        expect( lexer.analyze( line ) ).toBeNull()
    } );

    it( 'does not detect the name when its word is not the first one', () => {
        let line = 'Not the ' + word + ': Hello world';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'does not detect the name when its word is not followed by its separator', () => {
        let line = word + ' Hello world';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'does not detect the name not followed by its separator', () => {
        let line = word + ' ' + word + ' : Hello world';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'detects the name in the correct position', () => {
        let line = word + ': Hello world';

        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: keyword,
                name: "Hello world",
                location: { line: 1, column: 1 }
            }
        );
    } );

    it( 'detects the name in the correct position even with additional spaces or tabs', () => {
        let line = "  \t \t" + word + " \t : \t Hello world     ";

        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: keyword,
                name: "Hello world",
                location: { line: 1, column: 6 }
            }
        );
    } );

    it( 'detects a invalid name but registers an error', () => {
        let line = word + ': 1nv4lid n4me ';

        let r = lexer.analyze( line, 1 );
        let node = r.nodes[ 0 ];

        expect( node ).toEqual(
            {
                nodeType: keyword,
                name: "1nv4lid n4me",
                location: { line: 1, column: 1 }
            }
        );

        expect( r.errors ).toHaveLength( 1 );

        let e = r.errors[ 0 ];
        expect( e.location.column ).toBe( word.length + ': '.length + 1 );
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