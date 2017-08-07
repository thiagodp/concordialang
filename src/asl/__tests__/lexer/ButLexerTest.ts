import { Keywords } from '../../modules/req/Keywords';
import { ButLexer } from "../../modules/req/lexer/ButLexer";

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
        expect( r ).not.toBeNull()
        // Location
        expect( r.node.location.line ).toBe( 1 );
        expect( r.node.location.column ).toBe( 8 );
        // Keyword
        expect( r.node.keyword ).toBe( Keywords.STEP_BUT );
        // Content
        expect( r.node.content ).toBe( 'the world and everybody on it' );
    } );

} );