import { NodeTypes } from '../../modules/req/NodeTypes';
import { NameIsContentLexer } from '../../modules/lexer/NameIsContentLexer';

describe( 'NameIsContentLexerTest', () => {

    let words = [ 'is' ];
    let keyword = NodeTypes.REGEX;
    let lexer = new NameIsContentLexer( words, keyword );

    it( 'recognizes correctly', () => {
        let line = '- "foo" is "bar" ';
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                content: "bar"
            }
        );
    } );

} );