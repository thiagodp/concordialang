import { RegexLexer } from '../../modules/lexer/RegexLexer';
import { NodeTypes } from '../../modules/req/NodeTypes';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'RegexLexerTest', () => {

    let words = [ 'regular expressions' ];
    let lexer = new RegexLexer( words );

    // IMPORTANT: Since RegexLexer inherits from KeywordBlockLexer and 
    // there is a KeywordBlockLexerTest, few tests are necessary.

    it( 'detects in the correct position', () => {
        let line = '\tRegular expressions\t:\t';
        let node = lexer.analyze( line, 1 ).nodes[ 0 ];
        expect( node ).toEqual(
            {
                nodeType: NodeTypes.REGEX,
                location: { line: 1, column: 2 }
            }
        );
    } );    

} );