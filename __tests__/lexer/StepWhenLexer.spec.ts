import { StepWhenLexer } from "../../modules/lexer/StepWhenLexer";
import { NodeTypes } from '../../modules/req/NodeTypes';

describe( 'StepWhenLexer', () => {

    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects
    // that does not need to be repeated here.

    let words = [ 'when' ];
    let lexer = new StepWhenLexer( words );

    it( 'detects correctly', () => {
        let line = "  \t  \t When \t the world and everybody on it \t";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        let node = r.nodes[ 0 ];
        // Location
        expect( node.location.line ).toBe( 1 );
        expect( node.location.column ).toBe( 8 );
        // Keyword
        expect( node.nodeType ).toBe( NodeTypes.STEP_WHEN );
        // Content
        expect( node.content ).toBe( 'When \t the world and everybody on it' );
    } );

} );