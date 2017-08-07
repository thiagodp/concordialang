import { Keywords } from '../../modules/req/Keywords';
import { TextLexer } from "../../modules/req/lexer/TextLexer";

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
        expect( r ).not.toBeNull()
        // Location
        expect( r.node.location.line ).toBe( 1 );
        expect( r.node.location.column ).toBe( 8 );
        // Keyword
        expect( r.node.keyword ).toBe( Keywords.TEXT );
        // Content
        expect( r.node.content ).toBe( '  \t  \t anything here \t' );
    } );

} );