import { TokenTypes } from '../../modules/req/TokenTypes';
import { StepWhenLexer } from "../../modules/lexer/StepWhenLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'StepWhenLexerTest', () => {

    let words = [ 'when' ];
    let lexer = new StepWhenLexer( words );
    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects 
    // that does not need to be repeated here.

    it( 'detects correctly', () => {
        let line = "  \t  \t When \t the world and everybody on it \t";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        let node = r.nodes[ 0 ];
        // Location
        expect( node.location.line ).toBe( 1 );
        expect( node.location.column ).toBe( 8 );
        // Keyword
        expect( node.keyword ).toBe( TokenTypes.STEP_WHEN );
        // Content
        expect( node.content ).toBe( 'the world and everybody on it' );
    } );

} );