import { Keywords } from '../../modules/req/Keywords';
import { StartingKeywordLexer } from '../../modules/req/lexer/StartingKeywordLexer';
import { GivenLexer } from "../../modules/req/lexer/GivenLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'GivenLexerTest', () => {

    let words = [ 'given' ];
    let lexer = new GivenLexer( words );
    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects 
    // that does not need to be repeated here.

    it( 'detects correctly', () => {
        let line = "  \t  \t Given \t the world and everybody on it \t";
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull()
        // Location
        expect( r.node.location.line ).toBe( 1 );
        expect( r.node.location.column ).toBe( 8 );
        // Keyword
        expect( r.node.keyword ).toBe( Keywords.STEP_GIVEN );
        // Content
        expect( r.node.content ).toBe( 'the world and everybody on it' );
    } );

} );