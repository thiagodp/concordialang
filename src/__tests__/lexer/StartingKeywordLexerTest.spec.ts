import { StartingKeywordLexer } from '../../modules/lexer/StartingKeywordLexer';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'StartingKeywordLexerTest', () => {

    let words = [ 'hello' ];
    let keyword = 'hello';
    let lexer = new StartingKeywordLexer( words, keyword );

    it( 'detects in a line', () => {
        let line = 'hello world';
        expect( lexer.analyze( line ) ).not.toBeNull();
    } );

    it( 'detects in a line with spaces and tabs', () => {
        let line = "  \t  \t Hello \t\t world";
        expect( lexer.analyze( line ) ).not.toBeNull()
    } );

    it( 'does not detect an inexistent feature in a line', () => {
        let line = 'Someelse world';
        expect( lexer.analyze( line ) ).toBeNull()
    } );

    it( 'detects in the correct position', () => {
        let line = "  \t  \t hello \t world and everybody on it \t";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node.location.line ).toBe( 1 );
        expect( node.location.column ).toBe( 8 );
    } );
    
    it( 'detects the content correctly', () => {
        let line = '\t hello  \t\t world \t';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        expect( node.content ).toBe( 'world' );
    } );

    it( 'does not detect without a space after the keyword', () => {
        let line = '\t helloworld \t';
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeNull();
    } );    

} );