import { TextLexer } from "../../modules/lexer/TextLexer";
import { TokenTypes } from '../../modules/req/TokenTypes';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'TextLexerTest', () => {

    let lexer = new TextLexer();

    it( 'does not recognize empty lines', () => {
        expect( lexer.analyze( '' ) ).toBeNull();
    } );

    it( 'detects anything as text', () => {
        let line = "  \t  \t anything here \t";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        let node = r.nodes[ 0 ];
        // Location
        expect( node.location.line ).toBe( 1 );
        expect( node.location.column ).toBe( 8 );
        // Keyword
        expect( node.keyword ).toBe( TokenTypes.TEXT );
        // Content
        expect( node.content ).toBe( '  \t  \t anything here \t' );
    } );

} );