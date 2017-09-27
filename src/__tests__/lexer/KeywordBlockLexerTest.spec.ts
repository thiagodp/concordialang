import { KeywordBlockLexer } from "../../modules/lexer/KeywordBlockLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'KeywordBlockLexerTest', () => {

    let keyword = 'anything';
    let lexer = new KeywordBlockLexer( [ keyword ], keyword );
    let wordInsensitive = 'AnYtHinG';
    
    it( 'is detected in a line', () => {

        let r = lexer.analyze( 'Anything:', 1 );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 }
            }
        );        
    } );

    it( 'detects in a case insensitive way', () => {
        let line = wordInsensitive + ':';
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
    } );    

    it( 'detects in a line with spaces and tabs', () => {
        let line = "  \t  \t " + wordInsensitive + ":";
        let r = lexer.analyze( line );
        expect( r ).toBeDefined();
        expect( r.errors ).toHaveLength( 0 );
    } );    

    it( 'does not detect when the keyword is not the same', () => {
        let line = 'Someelse:';
        expect( lexer.analyze( line ) ).toBeNull()
    } );
    
    it( 'does not detect the name when its word is not the first one', () => {
        let line = 'Not the ' + wordInsensitive + ':';
        expect( lexer.analyze( line ) ).toBeNull();
    } );

    it( 'does not detect it is not followed by its separator', () => {
        let line = wordInsensitive + ' \t';
        expect( lexer.analyze( line ) ).toBeNull();
    } );
    
    it( 'registers an error when there is some content after the separator', () => {
        let content = 'some content here';
        let line = wordInsensitive + ': ' + content;
        let r = lexer.analyze( line );
        expect( r.errors ).toHaveLength( 1 );

        let e = r.errors[ 0 ];
        expect( e.location.column ).toBe( line.indexOf( content ) + 1 );
    } );    

} );