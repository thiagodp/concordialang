import { Keywords } from '../../modules/req/Keywords';
import { ButLexer } from "../../modules/lexer/ButLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ButLexerTest', () => {

    let words = [ 'but' ];
    let lexer = new ButLexer( words );
    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects 
    // that does not need to be repeated here.

    it( 'detects correctly', () => {
        let line = "  \t  \t But \t the world and everybody on it \t";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        expect( r.nodes ).toHaveLength( 1 );
        let node = r.nodes[ 0 ];
        // Location
        expect( node.location.line ).toBe( 1 );
        expect( node.location.column ).toBe( 8 );
        // Keyword
        expect( node.keyword ).toBe( Keywords.STEP_BUT );
        // Content
        expect( node.content ).toBe( 'the world and everybody on it' );
    } );

} );