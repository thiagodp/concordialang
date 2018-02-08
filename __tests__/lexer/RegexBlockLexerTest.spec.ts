import { RegexBlock } from '../../modules/ast/RegexBlock';
import { RegexBlockLexer } from '../../modules/lexer/RegexBlockLexer';
import { NodeTypes } from '../../modules/req/NodeTypes';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'RegexBlockLexerTest', () => {

    let words = [ 'regular expressions' ];
    let lexer = new RegexBlockLexer( words );; // under test

    // IMPORTANT: Since the lexer under test inherits from another lexer and 
    // there are tests for the parent class, few additional tests are necessary.

    it( 'detects in the correct position', () => {
        let line = '\tRegular expressions\t:\t';
        let node = lexer.analyze( line, 1 ).nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.REGEX_BLOCK,
                location: { line: 1, column: 2 }
            } as RegexBlock
        );
    } );

    it( 'ignores a comment', () => {
        let line = 'Regular expressions:# some comment here';
        let node = lexer.analyze( line, 1 ).nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.REGEX_BLOCK,
                location: { line: 1, column: 1 }
            } as RegexBlock
        );    
    } );    

} );