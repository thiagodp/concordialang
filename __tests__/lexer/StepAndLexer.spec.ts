import { StepAndLexer } from "../../modules/lexer/StepAndLexer";
import { NodeTypes } from '../../modules/req/NodeTypes';

describe( 'StepAndLexer', () => {

    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects
    // that does not need to be repeated here.

    let words = [ 'and' ];
    let lexer = new StepAndLexer( words ); // under test

    it( 'detects correctly', () => {
        let line = "  \t  \t And \t the world and everybody on it \t";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        // Location
        expect( node.location.line ).toBe( 1 );
        expect( node.location.column ).toBe( 8 );
        // Keyword
        expect( node.nodeType ).toBe( NodeTypes.STEP_AND );
        // Content
        expect( node.content ).toBe( 'And \t the world and everybody on it' );
    } );

} );